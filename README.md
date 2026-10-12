# Reino de Pavel — Country Branding

Identidad nacional completa del **Imperio del Reino de Pavel**, un estado soberano de un solo habitante y grandeza ilimitada.
Motto: **EL NON PLUS ULTRA**

El sitio son páginas HTML estáticas, sin build: la portada (`reino-de-pavel.dc.html`) y una página por ala del palacio, con estilos y scripts compartidos en `assets/`.

## Contenido

Cada sección es un `<section id="…">` en la página que indica la tabla y tiene su entrada en el menú
(`<nav id="pvl-nav">`, el mismo en todas las páginas), en el grupo que indica la tabla. **El menú es la fuente de verdad**: ninguna sección se añade, renombra o
quita sin que el menú, esta tabla, `sitemap.xml` y la Crónica la sigan en el mismo cambio. La regla
y su lista de comprobación están en [`AGENTS.md`](AGENTS.md) (copiada en [`CLAUDE.md`](CLAUDE.md)), y
`node tools/check-nav.mjs` la comprueba; `node tools/sync-nav.mjs` copia el menú de la portada a las
demás páginas.

Cada página interior lleva migas de pan, accesos a sus secciones y, al pie, «Las salas del palacio»:
enlaces a la portada y a todas las demás páginas. Los enlaces antiguos a la portada
(`reino-de-pavel.dc.html#visa`, con o sin `?ref=`) redirigen a la página nueva de la sección.

| Sección | Página | Menú | Qué incluye |
|---|---|---|---|
| Portada | `reino-de-pavel.dc.html` | — | Retrato ecuestre, cifras del Estado, botón de LinkedIn y el reproductor del himno **«El Ruir del Unicornio»** en bucle eterno |
| `#emblema` · Emblema | `el-reino.html` | El Reino | Escudo de armas (tres unicornios rampantes), monograma, versiones documento / iridiscente, logotipo horizontal |
| `#bandera` · Bandera | `el-reino.html` | El Reino | "La Iridiscente" (3:2), paleta y especímenes tipográficos |
| `#himno` · Himno | `reino-de-pavel.dc.html` | El Reino | Letra oficial, portada del himno, partitura, entrada del diccionario nacional |
| `#constitucion` · Constitución | `el-reino.html` | El Reino | Carta Magna de la Grandeza: preámbulo, siete artículos y disposición final |
| `#descartes` · Descartes | `el-reino.html` | El Reino | Reformulación del *cogito*: Descartes admite haberse equivocado al no pensar en Pavel |
| `#clima` · Clima | `el-reino.html` | El Reino | Servicio Meteorológico Nacional: pronóstico de cinco días y por regiones, sembrado con la fecha y siempre glorioso |
| `#documentos` · Pasaporte e identidad | `documentos.html` | Documentos | Pasaporte (cubierta + página de datos con MRZ), cédula imperial, licencia de conducir clase U |
| `#moneda` · Moneda y filatelia | `documentos.html` | Documentos | Billete de 100 Grandezas (anverso y reverso), moneda, sello postal de 5 G, sello fronterizo |
| `#papeleria` · Papelería | `documentos.html` | Documentos | Carta diplomática A4, sobre aéreo, certificado de ciudadanía (`#ciudadania`) |
| `#visa` · Visado | `documentos.html` | Documentos | Visado de cortesía y ventanilla de visados: solicitud, sello animado y visado descargable (PNG) con zona MRZ |
| `#calendario` · Calendario | `documentos.html` | Documentos | Ocho fiestas nacionales |
| `#hora-real` · Hora real | `documentos.html` | Documentos | Hora Estándar de Pavel (un minuto por delante), calendario pavelense y cuenta atrás a la próxima fiesta de `#calendario` |
| `#ciudadania` · Ciudadanía | `documentos.html` | Honores | El certificado de ciudadanía, descargable como tarjeta PNG |
| `#orden-unicornio` · Orden del Unicornio | `honores.html` | Honores | Medalla y certificado, con el nombre del peregrino |
| `#premio-pavel` · Premio Pavel | `honores.html` | Honores | Diploma académico |
| `#titulo` · Título real | `honores.html` | Honores | Generador de títulos nobiliarios: el mismo nombre, el mismo título; patente descargable en PNG |
| `#decreto` · Decreto | `ministerios.html` | Ministerios | Generador de decretos reales; «Sellar y descargar» lo entrega en un pergamino sellado (PNG) |
| `#quejas` · Quejas | `ministerios.html` | Ministerios | Ministerio de Quejas: ocho no-respuestas |
| `#quiz` · Quiz | `ministerios.html` | Ministerios | «¿Cuán pavelense eres?» |
| `#test-psi` · Test psicológico | `ministerios.html` | Ministerios | Test psicológico |
| `#oraculo` · Oráculo | `ministerios.html` | Ministerios | Oráculo del Unicornio: baraja de 20 cartas en SVG, tirada de una o de tres (pasado, presente, grandeza) |
| `#bolsa` · Bolsa | `ministerios.html` | Ministerios | Bolsa de la Grandeza: cinta de cotizaciones, índice PVL-100 y casa de cambio; todo sube, siempre |
| `#biblioteca` · Biblioteca Real | `biblioteca.html` | Cultura | El saber humano reescrito desde la perspectiva de Pavel |
| `#banda-sonora` · Banda sonora | `banda-sonora.html` | Cultura | Dieciséis pistas que todo pavelense digno escucha |
| `#descargas` · Descargas | `descargas.html` | Cultura | Fondos de pantalla, bandera, logotipo, sellos e himno |
| `#mapa` · Mapa | `reino-de-pavel.dc.html` | Cultura | Mapa interactivo de Pavelandia: vistas, Street View, Buc-ee's |
| `#juego` · Videojuego | `reino-de-pavel.dc.html` | Cultura | «Súper Pavel World», plataformas de 16 bits |
| `#pvl-changelog` · Crónica | `cronica.html` | enlace propio | Un «Decreto N.º n» por cada obra del Reino |

## Sistema de diseño

- **Colores**: Violeta Cosmos `#1B1150` · Oro Grandeza `#D8B25C` · Crin Iridiscente `#86E7EA → #F2A9DC` · Papel `#F4EFE2` · Tinta `#201A33`
- **Tipografía**: Bodoni Moda (títulos y denominaciones) · IBM Plex Sans (texto) · IBM Plex Mono (campos, series, MRZ)
- **Seguridad documental**: guilloches, microimpresión, hilo de seguridad, marca de agua, parche iridiscente, imagen latente, retrato fantasma, códigos de barras

## Uso

No hay build, dependencias ni instalación. Sirve la carpeta y abre la portada:

```bash
git clone <este-repo>
cd reino-de-pavel
python3 -m http.server 8000   # y abre http://localhost:8000/
```

Para publicarlo en GitHub Pages: activa Pages sobre la rama `main` (carpeta raíz). `index.html` redirige al documento.

### Parámetros

El componente expone dos controles de diseño:

- `guilloche` (bool) — tramas de seguridad de los documentos y el billete
- `holder` (texto) — nombre del titular impreso en pasaporte, cédula y licencia

### Idioma / Language

La página entera está en inglés y español. El interruptor **EN / ES**, junto al menú
de navegación de la portada, cambia todo el contenido (textos, documentos, himno,
constitución, el juego «El Mundo de Pavel»…) sin recargar la página. Por defecto se
muestra en inglés; la elección se guarda en `localStorage` para próximas visitas.

La lógica vive en `assets/js/i18n.js`, cargado desde el `<helmet>` de cada página (`window.PavelI18N`):
cada fragmento traducido es un par de `<span data-lang="es">`/`<span data-lang="en">`
y una clase `.pvl-hide` (con `!important`) oculta el idioma inactivo. Como el motor
del lienzo puede remontar el contenido de `<x-dc>` después del arranque, el mismo
`<script>` reaplica el idioma en un intervalo corto, igual que hacen el reproductor
del himno y «El Mundo de Pavel» con sus propios reintentos.

### El himno en la portada

**El himno suena solo en la portada.** Cada página es un documento aparte y navegar entre ellas corta el
audio; volver a arrancarlo en cada página sería peor que el silencio. Las páginas interiores son
silenciosas, salvo la banda sonora, que lleva su propio `<audio>` y toca el himno solo si el visitante
elige esa pista.

El reproductor de la portada toca `assets/Bajo_el_Manto_de_Pavel.mp3` en bucle continuo, con play/pausa,
barra de avance arrastrable y tiempo transcurrido.

Intenta sonar solo al abrir la página. Los navegadores bloquean el audio con sonido hasta que hay
interacción, así que si el arranque automático se rechaza el himno entra en cuanto el visitante
hace clic, toca o pulsa una tecla en cualquier parte de la página.

> La lógica del reproductor vive en `assets/js/himno.js`, cargado desde el `<helmet>`, no junto al marcado: el cuerpo
> del documento se monta después de que corre el script, de ahí que todo se delegue en `document` y que
> los elementos se busquen en cada uso. Ese bloque se ejecuta **dos veces** —una al parsear el documento
> y otra cuando `support.js` lo remonta en `<head>`— por lo que un candado global (`window.__himnoPavel`)
> evita registrar los oyentes por duplicado. El atributo `loop` sin valor lo descarta el runtime del
> lienzo, así que el bucle se fija también desde JavaScript.

### Súper Pavel World

El videojuego de la sección `#juego` vive entero en `assets/js/juego.js` (`window.__pvlSuperPavel`):
lienzo de 320×180 escalado sin suavizado, sprites dibujados en código, sonido con Web Audio. Para
probar un mundo concreto sin jugar los anteriores, añade `?juego-nivel=2` o `?juego-nivel=3` a la URL.

## Estructura

```
.
├── AGENTS.md / CLAUDE.md      # reglas para quien cambie el sitio (el menú es obligatorio)
├── index.html                 # redirección a la portada
├── reino-de-pavel.dc.html     # portada: héroe, himno, mapa, videojuego, convocatoria
├── el-reino.html              # emblema, bandera, constitución, Descartes
├── documentos.html            # pasaporte, moneda, papelería y ciudadanía, visado, calendario
├── honores.html               # Orden del Unicornio, Premio Pavel
├── ministerios.html           # decreto, quejas, quiz, test psicológico
├── biblioteca.html            # Biblioteca Real
├── banda-sonora.html          # banda sonora
├── descargas.html             # Archivo Real de Descargas
├── cronica.html               # Crónica de decretos
├── support.js                 # runtime del componente
└── assets/
    ├── css/reino.css          # estilos compartidos por todas las páginas
    ├── js/                    # un script por función (i18n, menu, himno, mapa, juego…)
    │   └── anclas.js          # redirige los #anclas antiguos de la portada
    ├── anthem-cover.png       # portada del himno
    ├── Bajo_el_Manto_de_Pavel.mp3  # himno «El Ruir del Unicornio» (reproductor de portada)
    ├── crest-unicorns.jpg     # escudo / armas mayores
    ├── pavel-head.png         # efigie oficial (foto, cédula, billete)
    ├── pavel-unicorn.png      # retrato ecuestre de Estado
    ├── descargas/             # Archivo Real de Descargas: fondos, bandera, logotipo, sellos
    └── juego/pavel-cabeza.png # la cabeza de Pavel para «Súper Pavel World» (64 px)
tools/
├── check-nav.mjs              # comprueba que el menú refleja las secciones
├── sync-nav.mjs               # copia el menú y «Las salas del palacio» a todas las páginas
├── descargas.html             # plantilla de los fondos, la bandera y el logotipo
└── render-descargas.mjs       # los regenera con Chrome sin interfaz
```

### Regenerar las descargas

Los fondos de pantalla, la bandera y el logotipo de `assets/descargas/` salen de
`tools/descargas.html`. Tras cambiar la plantilla:

```bash
python3 -m http.server 8642 &
node tools/render-descargas.mjs
```

Necesita Node 22+ y `google-chrome`. Los sellos monograma (`.svg`) se editan a mano.

## Créditos

Himno y doctrina nacional: Pavel Navarro. Diseño de identidad, documentos y constitución: este repositorio.

> Y tú, lector, existes porque Pavel existe.
