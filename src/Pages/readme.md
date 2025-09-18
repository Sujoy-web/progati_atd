API Endpoints

Authentication
- POST `/auth/login`  - Login user and return access/refresh tokens
- POST `/auth/refresh` - Refresh access token using refresh token

Users
- POST `/users/`        - Create a new user (within current tenant)
- GET `/users/me`       - Get current user information
- GET `/users/`         - Get all users in current tenant
- GET `/users/{user_id}` - Get specific user by ID (within current tenant)
- PUT `/users/{user_id}` - Update user (within current tenant)
- DELETE `/users/{user_id}` - Delete user (within current tenant)

Tenants
- POST `/tenants/`            - Create a new tenant (superusers only)
- GET `/tenants/`             - Get all tenants (superusers only)
- GET `/tenants/{tenant_id}`  - Get specific tenant by ID (superusers or own tenant)
- PUT `/tenants/{tenant_id}`  - Update tenant (superusers only)
- DELETE `/tenants/{tenant_id}` - Delete tenant (superusers only)

General
- GET `/`        - Welcome message
- GET `/health`  - Health check endpoint

The API implements multitenancy with role-based access control, where regular users can only access resources within their own tenant, while superusers have broader access.
