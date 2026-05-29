# Recuperacion de contraseña con Supabase Auth

## Contexto

El login del ERP de A Darlo Todo usa usuarios gestionados por Supabase Auth.

En el rediseño inicial del login se dejo el texto `¿Olvidaste tu contraseña?` como elemento visual. Este documento resume que habria que implementar mas adelante para convertirlo en una funcionalidad real.

## Criterio principal

La recuperacion de contraseña debe apoyarse en el flujo nativo de Supabase Auth.

No se debe implementar una logica propia de contraseñas en Appsmith, ni manipular hashes manualmente, ni usar llaves privilegiadas como `service_role` desde la aplicacion.

## Flujo esperado

1. El usuario ingresa su email en el login.
2. Hace click en `¿Olvidaste tu contraseña?`.
3. Appsmith valida que exista un email ingresado.
4. Appsmith llama al endpoint de recuperacion de Supabase Auth.
5. Supabase envia un correo con link de recuperacion.
6. El usuario abre el link del correo.
7. El link redirige a una pagina de Appsmith para definir una nueva contraseña.
8. Appsmith usa la sesion o token temporal entregado por Supabase para actualizar la contraseña.
9. El usuario vuelve al login e inicia sesion normalmente.

## Configuracion necesaria en Supabase

Revisar en Supabase:

- `Authentication > URL Configuration`.
- `Site URL`, usando la URL real donde vive Appsmith.
- `Redirect URLs`, agregando la URL permitida para el flujo de recuperacion.
- Template del correo de recuperacion, si se quiere aplicar branding de A Darlo Todo.

Ejemplos de URL a definir, ajustando al despliegue real:

```text
https://app.adarlotodo.cl
https://app.adarlotodo.cl/app/...?page=login
https://app.adarlotodo.cl/app/...?page=cambiar-password
```

## Accion para solicitar recuperacion

Crear una API query en Appsmith contra Supabase Auth:

```http
POST https://<SUPABASE_PROJECT>.supabase.co/auth/v1/recover
```

Headers:

```http
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

Body:

```json
{
  "email": "{{inp_email.text}}"
}
```

La llave debe ser la `anon key` ya configurada como datasource o variable segura. No usar `service_role`.

## Logica sugerida en Appsmith

El texto visual podria convertirse en un boton o widget clickeable.

Ejemplo de logica:

```javascript
if (!inp_email.text) {
  showAlert("Ingresa tu email para recuperar la contraseña", "warning");
  return;
}

await reset_password.run();
showAlert("Te enviamos un correo para recuperar tu contraseña", "success");
```

## Pagina para nueva contraseña

Crear una pagina separada, por ejemplo `Cambiar Password` o `Nueva contraseña`.

Esa pagina deberia:

- Leer los parametros/tokens que Supabase entregue al volver desde el correo.
- Validar que la sesion temporal sea usable.
- Pedir nueva contraseña y confirmacion.
- Ejecutar el endpoint de actualizacion de usuario autenticado.

Endpoint:

```http
PUT https://<SUPABASE_PROJECT>.supabase.co/auth/v1/user
```

Body:

```json
{
  "password": "{{inp_new_password.text}}"
}
```

El request debe usar el `access_token` temporal entregado por Supabase en el flujo de recuperacion.

## Consideraciones importantes

- No exponer secretos ni credenciales en widgets, JSObjects o queries.
- No usar `service_role` en Appsmith.
- Confirmar como Appsmith recibe y permite leer los parametros del redirect.
- Probar el flujo completo en ambiente no productivo antes de habilitarlo para usuarios reales.
- Revisar el template del email para que el usuario entienda que el correo viene de A Darlo Todo.
- Si el link expira, mostrar un mensaje claro y permitir solicitar otro correo.

## Pendientes para implementar

- Confirmar URL final de Appsmith.
- Confirmar si existira pagina dedicada para cambio de contraseña.
- Confirmar donde vive actualmente la `anon key` en Appsmith.
- Crear API query de recuperacion.
- Crear JSObject o funcion de orquestacion.
- Conectar el widget `¿Olvidaste tu contraseña?`.
- Crear flujo para setear nueva contraseña desde el redirect.
- Probar con un usuario real de Supabase Auth.
