# Fotky realizací

Galerie používá všech devět snímků ze složky `dist/ourwork/`.
Na hlavní stránce se všech devět snímků plynule posouvá v pruhu omezeném
na šířku obsahu, nikoli celé obrazovky. Poměr stran zůstává zachovaný bez ořezu.
Odkaz „Prohlédnout vše“ otevírá modální galerii všech devíti fotografií.
Animace respektuje omezený pohyb; při ovládání klávesnicí lze posouvat ručně.
V modálu, mimo viewport a na skryté kartě prohlížeče se animace zastaví.
Bez JavaScriptu jsou vidět všechny náhledy v mřížce a odkazy vedou na originály.
WebP soubory v této složce jsou optimalizované kopie (max. 1000 px,
kvalita 84). Originály zůstávají beze změny a otevřou se v modální galerii
kliknutím na fotku. Galerie podporuje šipky a zavření klávesou Escape.

Sem vložte fotografie pro galerii „Naše práce“ (ideálně JPG nebo WebP).
Jednotlivá místa jsou označená `data-work-photo="1"` až `"9"`
v `dist/index.html`. Zástupný obsah každého místa lze nahradit obrázkem:

```html
<img src="assets/nase-prace/nazev-fotky.jpg" alt="Popis konkrétní realizace" loading="lazy" decoding="async">
```

Soubory se samy nenačítají; po jejich vložení je potřeba doplnit odkazy v HTML.
Používejte pouze fotky, k jejichž zveřejnění máte oprávnění.
Recenze a hodnocení se zatím z Googlu nenačítají; texty a hvězdičky karet jsou
návrhové podklady, nikoli ověřené recenze firmy. Před zveřejněním je potřeba
je nahradit skutečnými daty. Souhrnné hodnocení se bez ověřených dat nezobrazuje.
