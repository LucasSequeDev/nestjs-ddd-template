import { Command } from "commander";
import ejs from "ejs";
import fs from "fs";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";

import { toPascalCase } from "../utils/toPascalCase.js";

const FOLDER_BASE = ["application", "domain", "infrastructure"];
const FOLDER_APPLICATION = [];
const FOLDER_DOMAIN = ["entities", "repositories", "events", "dtos"];
const FOLDER_INFRASTRUCTURE = ["repositories", "services"];

const QUESTIONS = [
  {
    type: "input",
    name: "_moduleName",
    message: "Nombre del modulo",
  },
  {
    type: "input",
    name: "_useCaseName",
    message: "Nombre del caso de uso",
  },
  {
    type: "list",
    name: "_access",
    message: "¿Como se expondra este caso de uso?",
    choices: ["controller", "subscriber", "event"],
  },
  {
    type: "input",
    name: "_serviceName",
    message: "Nombre del servicio externo",
  },
  {
    type: "input",
    name: "_repositoryName",
    message: "Nombre del repositorio",
  },
];

export function createNewModule(program: Command) {
  program
    .command("create:module")
    .alias("m")
    .description("Crea un nuevo modulo.")
    .action(async () => {
      const {
        _moduleName,
        _useCaseName,
        _access,
        _serviceName,
        _repositoryName,
      } = await inquirer.prompt(QUESTIONS);

      const moduleName = toPascalCase(_moduleName);
      const useCaseName = toPascalCase(_useCaseName);
      const serviceName = toPascalCase(_serviceName);
      const repositoryName = toPascalCase(_repositoryName);
      const modulePath = path.join("src/modules", moduleName);

      if (fs.existsSync(modulePath)) {
        console.error("Error: El módulo ya existe.");
        process.exit(1);
      }

      const spinner = ora("Creando template del remoto").start();

      FOLDER_BASE.forEach(folder => {
        fs.mkdirSync(path.join(modulePath, folder), { recursive: true });

        if (folder === "application") {
          FOLDER_APPLICATION.forEach(folderApp => {
            fs.mkdirSync(path.join(modulePath, folder, folderApp), {
              recursive: true,
            });
          });

          if (useCaseName) {
            fs.mkdirSync(path.join(modulePath, folder, useCaseName), {
              recursive: true,
            });

            // Create use case file
            const useCaseFileContent = `import { Injectable } from "@nestjs/common";

import {  ${repositoryName}Repository } from "../../domain/repositories/ ${repositoryName}Repository";

@Injectable()
export class ${useCaseName} {
  constructor(
    private readonly repository: ${repositoryName}Repository
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
          FOLDER_DOMAIN.forEach(folderDomain => {
            fs.mkdirSync(path.join(modulePath, folder, folderDomain), {
              recursive: true,
            });
          });

          // create repository file
          // TODO: create repository file
        }

        if (folder === "infrastructure") {
          [...FOLDER_INFRASTRUCTURE, _access].forEach(folderInfra => {
            fs.mkdirSync(path.join(modulePath, folder, folderInfra), {
              recursive: true,
            });
          });

          // create repository file
          // TODO: create repository file

          // create service file
          // TODO: create service file

          // TODO: CREATE A LOGIC TO CREATE THE FILE BASED ON THE ACCESS
          // create controller file
          // TODO: create controller file

          // create subscriber file
          // TODO: create subscriber file

          // create event file
          // TODO: create event file
        }
      });

      spinner.stop();

      //   const declaration = `${name}/${module}`;

      //   const data = {
      //     name,
      //     scopeRemote,
      //     module,
      //     pathremote,
      //     devUrl,
      //     stgUrl,
      //     prodUrl,
      //     declaration,
      //   };
      //   const spinner = ora("Creando template del remoto").start();

      //   try {
      //     const allTemplates = await await fs.readdir(
      //       path.join(__dirname, "..", "templates", "mfe-generate-remote"),
      //     );
      //     const templatesEjs = allTemplates.filter(template =>
      //       template.includes(".ejs"),
      //     );
      //     const templatesNotEjs = allTemplates.filter(
      //       template => !template.includes(".ejs"),
      //     );

      //     const outputPath = path.join(
      //       process.cwd(),
      //       "src",
      //       "app",
      //       "remotes",
      //       module,
      //     );

      //     await fs.mkdir(outputPath, { recursive: true });

      //     for (const template of templatesEjs) {
      //       const templateContent = await fs.readFile(
      //         path.join(
      //           __dirname,
      //           "..",
      //           "templates",
      //           "mfe-generate-remote",
      //           template,
      //         ),
      //         { encoding: "utf-8" },
      //       );
      //       const output = ejs.render(templateContent, data);

      //       const newFileName = template.replace(".ejs", "");

      //       const outputFile = path.join(outputPath, newFileName);

      //       await fs.writeFile(outputFile, output, "utf8");

      //       console.log("Se creo ", outputFile, " 😎");
      //     }

      //     for (const template of templatesNotEjs) {
      //       const output = await fs.readFile(
      //         path.join(
      //           __dirname,
      //           "..",
      //           "templates",
      //           "mfe-generate-remote",
      //           template,
      //         ),
      //         { encoding: "utf-8" },
      //       );

      //       const outputFile = path.join(outputPath, template);

      //       await fs.writeFile(outputFile, output, "utf8");

      //       console.log("Se creo ", outputFile, " 😎");
      //     }
      //   } catch (error) {
      //     return console.error(error);
      //   } finally {
      //     spinner.stop();
      //   }
    });
}
