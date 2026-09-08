# Reino de Pavel — Country Branding

Identidad nacional completa del **Imperio del Reino de Pavel**, un estado soberano de un solo habitante y grandeza ilimitada.
Motto: **EL JODIDO FINAL**

Todo el sistema vive en un único archivo HTML autocontenido (`reino-de-pavel.dc.html`) con estilos en línea.

## Contenido

| Sección | Qué incluye |
|---|---|
| 01 · Emblema | Escudo de armas (tres unicornios rampantes), monograma, versiones documento / iridiscente, logotipo horizontal |
| 02 · Bandera | "La Iridiscente" (3:2), paleta y especímenes tipográficos |
| 03 · Documentos | Pasaporte (cubierta + página de datos con MRZ), cédula imperial, licencia de conducir clase U |
| 04 · Moneda y filatelia | Billete de 100 Grandezas (anverso y reverso), sello postal de 5 G, sello de control fronterizo |
| 05 · Himno | Letra oficial, portada del himno, entrada del diccionario nacional |
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

El componente expone tres controles:

- `bilingual` (bool) — subtítulos en inglés en cada sección y documento
- `guilloche` (bool) — tramas de seguridad de los documentos y el billete
- `holder` (texto) — nombre del titular impreso en pasaporte, cédula y licencia

## Estructura

```
.
├── index.html                 # redirección
├── reino-de-pavel.dc.html     # el documento completo
├── support.js                 # runtime del componente
└── assets/
    ├── anthem-cover.png       # portada del himno
    ├── crest-unicorns.jpg     # escudo / armas mayores
    ├── pavel-head.png         # efigie oficial (foto, cédula, billete)
    └── pavel-unicorn.png      # retrato ecuestre de Estado
```

## Créditos

Himno y doctrina nacional: Pavel Navarro. Diseño de identidad, documentos y constitución: este repositorio.

> Y tú, lector, existes porque Pavel existe.
