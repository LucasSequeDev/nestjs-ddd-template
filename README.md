# Template NestJS using Architecture Oriented by Domain

## Folder Structure

Create a new module execute the command below:

```bash
npm run module -- -n ModuleName -c UseCasesName
```

```bash
src
├── app.module.ts
├── main.ts
└── Modules
    └── ModuleName
        ├── application
        │   └── UseCasesName
        ├── domain
        │   ├── entities
        │   ├── repositories
        │   ├── events
        │   └── dto
        └── infrastructure
            ├── controllers
            ├── repositories
            ├── services
            └── subscribers

```
