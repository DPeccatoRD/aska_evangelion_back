import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./exceptions/http-exception.filter";

async function start() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule)

    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder()
        .setTitle('ASKA Backend API')
        .setDescription('Документация REST API')
        .setVersion('1.0.0')
        .addTag('by Dinmukhammed')
        .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document)

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        skipMissingProperties: true, // Важно для параметров URL
    }));


    app.enableCors();

    await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`))
}

start()
