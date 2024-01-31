import { Controller, Get, HttpCode } from "@nestjs/common";

@Controller("health")
export class HealthController {
  constructor() {}

  @Get()
  @HttpCode(200)
  run() {
    console.log("Health endpoint called!");
    return { status: "ok" };
  }
}
