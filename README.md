# BINGO

PROYECTO DE REDES DE COMPUTADORES I DE LA UNIVERSIDAD CATÓLICA ANDRÉS BELLO

## REQUISITOS

-   AMBIENTE WINDOWS
-   VSPE (VIRTUAL SERVER PORT SIMULATOR)
-   SERVIDOR NODE.JS
-   NPM o YARN
-   VUE CLI

## DISTRIBUCIÓN DE PUERTOS

| PC  | COM ENTRADA | COM SALIDA |
| --- | :---------: | :--------: |
| 1   |     14      |     11     |
| 2   |     11      |     12     |
| 3   |     12      |     13     |
| 4   |     13      |     14     |

## INSTALACIÓN

INSTALAR DEPENDENCIAS PARA SERVIDOR

```bash
$ cd server/
$ nmp install
```

INSTALAR DEPENDENCIAS PARA CLIENTE

```bash
$ cd client/
$ npm install
```

CREAR PUERTOS VIRTUALES PARES EN VSPE (ASUMISIONES)

## EJECUCIÓN

SE INICIA EL SERVIDOR O JUGADOR

```bash
$ cd server/
$ npm run dev --port=8000

```

SE INICIA TANTOS JUGADORES SE NECESITEN... (HASTA \_\_ THX BIAGIO)

```bash
$ cd server/
$ npm run dev --port=9000
```

PARA COMUNICAR SERVIDOR Y CLIENTE UTILIZAMOS SOCKET.IO

```bash
$ cd client/
$ npm run serve -- --mode portOne
```

PARA OTROS JUGADORES

```bash
$ cd client/
$ npm run serve -- --mode portTwo
```

## PROTOCOLO

TBA
