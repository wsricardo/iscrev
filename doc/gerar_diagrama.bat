@echo off
echo Certifique-se de ter o Node.js instalado (npm e npx).
echo Gerando a imagem do diagrama de arquitetura...
npx -y @mermaid-js/mermaid-cli mmdc -i "%~dp0Architecture_DiarioJS.mmd" -o "%~dp0Architecture_DiarioJS.png" -b white
echo.
echo Concluido! A imagem Architecture_DiarioJS.png foi gerada em: %~dp0
pause