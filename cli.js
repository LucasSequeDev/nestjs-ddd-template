/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

// Procesa los argumentos de línea de comando
const argv = yargs(hideBin(process.argv))
  .option("n", {
    alias: "nombre",
    describe: "El nombre del módulo",
    type: "string",
    demandOption: true,
  })
  .option("c", {
    alias: "casouso",
    describe: "El caso de uso",
    type: "string",
  }).argv;

console.log({ argv });

// Convierte una cadena a PascalCase
function toPascalCase(str) {
  return str.replace(
    /(\w)(\w*)/g,
    (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase(),
  );
}

// Nombre del módulo en PascalCase
const moduleName = toPascalCase(argv.nombre);
const modulePath = path.join(__dirname, "src/modules", moduleName);

// Verifica si el módulo ya existe
if (fs.existsSync(modulePath)) {
  console.error("Error: El módulo ya existe.");
  process.exit(1);
}

// Crea las carpetas necesarias
const foldersBase = ["application", "domain", "infrastructure"];
const foldersApplication = [];
const foldersDomain = ["entities", "repositories", "events", "dtos"];
const foldersInfrastructure = [
  "repositories",
  "services",
  "controllers",
  "subscribers",
  "events",
];

foldersBase.forEach(folder => {
  fs.mkdirSync(path.join(modulePath, folder), { recursive: true });

  // Crea el caso de uso si existe el parametro
  if (folder === "application") {
    foldersApplication.forEach(folderApp => {
      fs.mkdirSync(path.join(modulePath, folder, folderApp), {
        recursive: true,
      });
    });

    if (argv.casouso) {
      const useCaseName = toPascalCase(argv.casouso);
      fs.mkdirSync(path.join(modulePath, folder, useCaseName), {
        recursive: true,
      });
      const useCaseFileContent = `import { Injectable } from "@nestjs/common";

import { ExampleRepository } from "../../domain/repositories/ExampleRepository";
        
@Injectable()
export class ${useCaseName} {
  constructor(
    private readonly repository: ExampleRepository
  ) {}

  async execute(id: string): Promise<void> {
    // Create a Use Case
    return this.repository.create(id);
  }
}`;
      fs.writeFileSync(
        path.join(modulePath, folder, useCaseName, "index.ts"),
        useCaseFileContent,
      );
    }
  }

  if (folder === "domain") {
    foldersDomain.forEach(folderDomain => {
      fs.mkdirSync(path.join(modulePath, folder, folderDomain), {
        recursive: true,
      });
    });
    const repositoruFileContent = `export abstract class ExampleRepository {
  abstract create(id: string): Promise<void>;
}`;
    fs.writeFileSync(
      path.join(modulePath, folder, "repositories", "ExampleRepository.ts"),
      repositoruFileContent,
    );
  }

  if (folder === "infrastructure") {
    foldersInfrastructure.forEach(folderInfra => {
      fs.mkdirSync(path.join(modulePath, folder, folderInfra), {
        recursive: true,
      });
    });
  }
});

// Crea el archivo module.ts
const moduleFileContent = `export class ${moduleName}Module {}`;
fs.writeFileSync(
  path.join(modulePath, `${moduleName}.module.ts`),
  moduleFileContent,
);

console.log(`Módulo ${moduleName} creado con éxito.`);
