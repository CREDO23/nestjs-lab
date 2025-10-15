import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { LogginMiddleware } from "../middlewares/logging.middleware";

@Module({})
export class LoggingModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LogginMiddleware).forRoutes('*');
    }
}
