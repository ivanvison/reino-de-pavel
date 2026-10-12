# Reino de Pavel — Country Branding

Identidad nacional completa del **Imperio del Reino de Pavel**, un estado soberano de un solo habitante y grandeza ilimitada.
Motto: **EL NON PLUS ULTRA**

Todo el sistema vive en un único archivo HTML autocontenido (`reino-de-pavel.dc.html`) con estilos en línea.

## Contenido

Cada sección es un `<section id="…">` y tiene su entrada en el menú (`<nav id="pvl-nav">`), en el
grupo que indica la tabla. **El menú es la fuente de verdad**: ninguna sección se añade, renombra o
quita sin que el menú, esta tabla, `sitemap.xml` y la Crónica la sigan en el mismo cambio. La regla
y su lista de comprobación están en [`AGENTS.md`](AGENTS.md) (copiada en [`CLAUDE.md`](CLAUDE.md)), y
`node tools/check-nav.mjs` la comprueba.

| Sección | Menú | Qué incluye |
|---|---|---|
| Portada | — | Retrato ecuestre, cifras del Estado, botón de LinkedIn y el reproductor del himno **«El Ruir del Unicornio»** en bucle eterno |
| `#emblema` · Emblema | El Reino | Escudo de armas (tres unicornios rampantes), monograma, versiones documento / iridiscente, logotipo horizontal |
| `#bandera` · Bandera | El Reino | "La Iridiscente" (3:2), paleta y especímenes tipográficos |
| `#himno` · Himno | El Reino | Letra oficial, portada del himno, partitura, entrada del diccionario nacional |
| `#constitucion` · Constitución | El Reino | Carta Magna de la Grandeza: preámbulo, siete artículos y disposición final |
| `#descartes` · Descartes | El Reino | Reformulación del *cogito*: Descartes admite haberse equivocado al no pensar en Pavel |
| `#documentos` · Pasaporte e identidad | Documentos | Pasaporte (cubierta + página de datos con MRZ), cédula imperial, licencia de conducir clase U |
| `#moneda` · Moneda y filatelia | Documentos | Billete de 100 Grandezas (anverso y reverso), moneda, sello postal de 5 G, sello fronterizo |
| `#papeleria` · Papelería | Documentos | Carta diplomática A4, sobre aéreo, certificado de ciudadanía (`#ciudadania`) |
| `#visa` · Visado | Documentos | Visado diplomático |
| `#calendario` · Calendario | Documentos | Ocho fiestas nacionales |
| `#ciudadania` · Ciudadanía | Honores | El certificado de ciudadanía, descargable como tarjeta PNG |
| `#orden-unicornio` · Orden del Unicornio | Honores | Medalla y certificado, con el nombre del peregrino |
| `#premio-pavel` · Premio Pavel | Honores | Diploma académico |
| `#decreto` · Decreto | Ministerios | Generador de decretos reales |
| `#quejas` · Quejas | Ministerios | Ministerio de Quejas: ocho no-respuestas |
| `#quiz` · Quiz | Ministerios | «¿Cuán pavelense eres?» |
| `#test-psi` · Test psicológico | Ministerios | Test psicológico |
| `#biblioteca` · Biblioteca Real | Cultura | El saber humano reescrito desde la perspectiva de Pavel |
| `#banda-sonora` · Banda sonora | Cultura | Dieciséis pistas que todo pavelense digno escucha |
| `#descargas` · Descargas | Cultura | Fondos de pantalla, bandera, logotipo, sellos e himno |
| `#mapa` · Mapa | Cultura | Mapa interactivo de Pavelandia: vistas, Street View, Buc-ee's |
| `#juego` · Videojuego | Cultura | «Súper Pavel World», plataformas de 16 bits |
| `#pvl-changelog` · Crónica | enlace propio | Un «Decreto N.º n» por cada obra del Reino |

## Sistema de diseño

- **Colores**: Violeta Cosmos `#1B1150` · Oro Grandeza `#D8B25C` · Crin Iridiscente `#86E7EA → #F2A9DC` · Papel `#F4EFE2` · Tinta `#201A33`
- **Tipografía**: Bodoni Moda (títulos y denominaciones) · IBM Plex Sans (texto) · IBM Plex Mono (campos, series, MRZ)
- **Seguridad documental**: guilloches, microimpresión, hilo de seguridad, marca de agua, parche iridiscente, imagen latente, retrato fantasma, códigos de barras

## Uso

Abre `reino-de-pavel.dc.html` en cualquier navegador moderno. No hay build, dependencias ni instalación.

```bash
git clone <este-repo>
cd reino-de-pavel
open reino-de-pavel.dc.html   # o simplemente arrástralo al navegador
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

La lógica vive en un `<script>` propio dentro del `<helmet>` (`window.PavelI18N`):
cada fragmento traducido es un par de `<span data-lang="es">`/`<span data-lang="en">`
y una clase `.pvl-hide` (con `!important`) oculta el idioma inactivo. Como el motor
del lienzo puede remontar el contenido de `<x-dc>` después del arranque, el mismo
`<script>` reaplica el idioma en un intervalo corto, igual que hacen el reproductor
del himno y «El Mundo de Pavel» con sus propios reintentos.

### El himno en la portada

El reproductor de la portada toca `assets/Bajo_el_Manto_de_Pavel.mp3` en bucle continuo, con play/pausa,
barra de avance arrastrable y tiempo transcurrido.

Intenta sonar solo al abrir la página. Los navegadores bloquean el audio con sonido hasta que hay
interacción, así que si el arranque automático se rechaza el himno entra en cuanto el visitante
hace clic, toca o pulsa una tecla en cualquier parte de la página.

> La lógica del reproductor vive en el `<script>` del bloque `<helmet>`, no junto al marcado: el cuerpo
> del documento se monta después de que corre el script, de ahí que todo se delegue en `document` y que
> los elementos se busquen en cada uso. Ese bloque se ejecuta **dos veces** —una al parsear el documento
> y otra cuando `support.js` lo remonta en `<head>`— por lo que un candado global (`window.__himnoPavel`)
> evita registrar los oyentes por duplicado. El atributo `loop` sin valor lo descarta el runtime del
> lienzo, así que el bucle se fija también desde JavaScript.

### Súper Pavel World

El videojuego de la sección `#juego` vive entero en un `<script>` del `<helmet>` (`window.__pvlSuperPavel`):
lienzo de 320×180 escalado sin suavizado, sprites dibujados en código, sonido con Web Audio. Para
probar un mundo concreto sin jugar los anteriores, añade `?juego-nivel=2` o `?juego-nivel=3` a la URL.

## Estructura

```
.
├── AGENTS.md / CLAUDE.md      # reglas para quien cambie el sitio (el menú es obligatorio)
├── index.html                 # redirección
├── reino-de-pavel.dc.html     # el documento completo
├── support.js                 # runtime del componente
└── assets/
    ├── anthem-cover.png       # portada del himno
    ├── Bajo_el_Manto_de_Pavel.mp3  # himno «El Ruir del Unicornio» (reproductor de portada)
    ├── crest-unicorns.jpg     # escudo / armas mayores
    ├── pavel-head.png         # efigie oficial (foto, cédula, billete)
    ├── pavel-unicorn.png      # retrato ecuestre de Estado
    ├── descargas/             # Archivo Real de Descargas: fondos, bandera, logotipo, sellos
    └── juego/pavel-cabeza.png # la cabeza de Pavel para «Súper Pavel World» (64 px)
tools/
├── check-nav.mjs              # comprueba que el menú refleja las secciones
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
