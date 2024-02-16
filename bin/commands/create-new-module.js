/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const inquirer = require("inquirer");
const ora = require("ora");
const path = require("path");

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

module.exports = function createNewModule(program) {
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

      const moduleName = _moduleName[0].toUpperCase() + _moduleName.slice(1);
      const useCaseName = _useCaseName[0].toUpperCase() + _useCaseName.slice(1);
      const serviceName = _serviceName[0].toUpperCase() + _serviceName.slice(1);
      const repositoryName =
        _repositoryName[0].toUpperCase() + _repositoryName.slice(1);
      const modulePath = path.join("src/modules", moduleName);

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

import {  ${repositoryName}Repository } from "../../domain/repositories/${repositoryName}Repository";

@Injectable()
export class ${useCaseName} {
  constructor(
    private readonly repository: ${repositoryName}Repository
  ) {}

  async execute(id: string): Promise<void> {
    // 🚀 Create a Use Case
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
          const repositoryFileContent = `export abstract class ${repositoryName}Repository {
  abstract create(): void;
}`;

          fs.mkdirSync(
            path.join(
              modulePath,
              folder,
              "repositories",
              repositoryName + "Repository",
            ),
          );

          fs.writeFileSync(
            path.join(
              modulePath,
              folder,
              "repositories",
              repositoryName + "Repository",
              "index.ts",
            ),
            repositoryFileContent,
          );
        }

        if (folder === "infrastructure") {
          [...FOLDER_INFRASTRUCTURE, _access].forEach(folderInfra => {
            fs.mkdirSync(path.join(modulePath, folder, folderInfra), {
              recursive: true,
            });
          });

          // create repository file
          const repositoryFileContent = `import { Injectable } from "@nestjs/common";
import { ${repositoryName}Repository } from "../../../domain/repositories/${repositoryName}Repository";
import { ${serviceName}Service } from "../../services/${serviceName}Service";

@Injectable()
export class ${serviceName}${repositoryName}Repository implements ${repositoryName}Repository {
  constructor(
    private readonly service: ${serviceName}Service,
  ) {}

  create(): void {
    // 🚀 Implement repository
  }
}`;

          fs.mkdirSync(
            path.join(
              modulePath,
              folder,
              "repositories",
              serviceName + repositoryName + "Repository",
            ),
          );

          fs.writeFileSync(
            path.join(
              modulePath,
              folder,
              "repositories",
              serviceName + repositoryName + "Repository",
              "index.ts",
            ),
            repositoryFileContent,
          );

          // create service file
          const serviceFileContent = `import { Injectable } from "@nestjs/common";

@Injectable()
export class ${serviceName}Service {
  constructor() {}

  create(): void {
    // 🚀 Implement service
  }
}`;

          fs.mkdirSync(
            path.join(modulePath, folder, "services", serviceName + "Service"),
          );

          fs.writeFileSync(
            path.join(
              modulePath,
              folder,
              "services",
              serviceName + "Service",
              "index.ts",
            ),
            serviceFileContent,
          );

          // create controller file
          if (_access === "controller") {
          }

          // create subscriber file
          if (_access === "subscriber") {
            const subscriberFileContent = `import { Injectable, OnApplicationBootstrap } from "@nestjs/common";

import { ${useCaseName} } from "../../../application/${useCaseName}";
import {
  Callback,
  SubscribeMessageQueueRepository,
} from "../../domain/repository/SubscribeMessageQueueRepository";

interface MessageQueue {
  body?: string;
  messageId?: string;
  receiptHandle?: string;
}

type Callback = (message: MessageQueue) => void;

@Injectable()
export class ${useCaseName}Subscriber implements OnApplicationBootstrap {
  constructor(
    private sub: SubscribeMessageQueueRepository,
    private useCase: ${useCaseName},
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.sub.subscribe(this.run);
  }

  private run: Callback = async message => {
    const { body } = message
    const messageReceived = this.getBodyMessage(body);
    this.useCase.execute(messageReceived);
  };

  private getBodyMessage(msg: string | undefined): string {
    if (!msg) {
      throw new Error("Message Queue is empty");
    }
    const json = JSON.parse(msg);
    if (!json.Message) {
      throw new Error("Message is empty");
    }
    const data = JSON.parse(json.Message);
    return data;
  }
}`;
            console.log(subscriberFileContent);
          }

          // create event file
          if (_access === "event") {
          }
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
};
