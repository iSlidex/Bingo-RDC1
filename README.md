# BINGO

PROYECTO DE REDES DE COMPUTADORES I DE LA UNIVERSIDAD CATÓLICA ANDRÉS BELLO

## REQUISITOS

-   AMBIENTE WINDOWS
-   VSPE (VIRTUAL SERVER PORT SIMULATOR)
-   SERVIDOR NODE.JS
-   NPM o YARN
-   VUE CLI

## DISTRIBUCIÓN DE PUERTOS

| PC  | COM LECTURA | COM ESCRITURA | PUERTO |
| --- | :---------: | :-----------: | :----: |
| 1   |     14      |      11       |  6000  |
| 2   |     11      |      12       |  7000  |
| 3   |     12      |      13       |  8000  |
| 4   |     13      |      14       |  9000  |

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

SE INICIA EL SERVIDOR O JUGADOR N

```bash
$ cd server/
$ npm run dev --equipo=N

```

SE INICIA TANTOS JUGADORES SE NECESITEN... (HASTA 4, THX BIAGIO)

```bash
$ cd server/
$ npm run dev --equipo=1
```

PARA COMUNICAR SERVIDOR Y CLIENTE **N** UTILIZAMOS SOCKET.IO

```bash
$ cd client/
$ npm run serve -- --mode PC*N*
```

PARA OTROS JUGADORES: (EJEMPLO)

```bash
$ cd client/
$ npm run serve -- --mode PC2
```

## PROTOCOLO

NT: Pasar turno

N<num>: Enviar/recibir número "num"

G: Alguien ganó

![esquema](https://cdn.discordapp.com/attachments/706893600281329795/738879864085545040/Bingo_Redes.png)
