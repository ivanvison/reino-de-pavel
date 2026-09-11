# Reino de Pavel — Country Branding

Identidad nacional completa del **Imperio del Reino de Pavel**, un estado soberano de un solo habitante y grandeza ilimitada.
Motto: **EL JODIDO FINAL**

Todo el sistema vive en un único archivo HTML autocontenido (`reino-de-pavel.dc.html`) con estilos en línea.

## Contenido

| Sección | Qué incluye |
|---|---|
| 00 · Portada | Retrato ecuestre, cifras del Estado y el reproductor del himno **«El Ruir del Unicornio»** en bucle eterno |
| 01 · Emblema | Escudo de armas (tres unicornios rampantes), monograma, versiones documento / iridiscente, logotipo horizontal |
| 02 · Bandera | "La Iridiscente" (3:2), paleta y especímenes tipográficos |
| 03 · Documentos | Pasaporte (cubierta + página de datos con MRZ), cédula imperial, licencia de conducir clase U |
| 04 · Moneda y filatelia | Billete de 100 Grandezas (anverso y reverso), sello postal de 5 G, sello de control fronterizo |
| 05 · Himno | Letra oficial, portada del himno, entrada del diccionario nacional (la grabación suena en el reproductor de la portada) |
| 06 · Constitución | Carta Magna de la Grandeza: preámbulo, siete artículos y disposición final |
| 07 · Descartes | Reformulación del *cogito*: Descartes admite haberse equivocado al no pensar en Pavel |
| 08 · Papelería | Carta diplomática A4, sobre aéreo, certificado de ciudadanía |

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

## Estructura

```
.
├── index.html                 # redirección
├── reino-de-pavel.dc.html     # el documento completo
├── support.js                 # runtime del componente
└── assets/
    ├── anthem-cover.png       # portada del himno
    ├── Bajo_el_Manto_de_Pavel.mp3  # himno «El Ruir del Unicornio» (reproductor de portada)
    ├── crest-unicorns.jpg     # escudo / armas mayores
    ├── pavel-head.png         # efigie oficial (foto, cédula, billete)
    └── pavel-unicorn.png      # retrato ecuestre de Estado
```

## Créditos

Himno y doctrina nacional: Pavel Navarro. Diseño de identidad, documentos y constitución: este repositorio.

> Y tú, lector, existes porque Pavel existe.
