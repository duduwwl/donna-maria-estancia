# Donna Maria — loja virtual

Site estático e responsivo, sem dependências de build. A página inicial é `index.html`, o catálogo fica em `produtos.html` e a área de gestão é `gestao.html`. Publique todos os arquivos juntos na mesma origem. A pasta `assets/` contém as fotografias fornecidas para o projeto.

## Loja

- Catálogo central em `catalog-data.js`; busca, categorias, ordenação, filtros, favoritos e sacola no navegador.
- Detalhe de produto com galeria opcional, tamanhos e cores opcionais, guia sem medidas presumidas e compartilhamento.
- Checkout com retirada ou consulta de CEP, preferência de pagamento e resumo encaminhado ao WhatsApp **(79) 99652-0909**. Nenhum pagamento é processado no site.
- O catálogo padrão é demonstrativo. Os preços precisam ser confirmados pela loja; não há tamanhos, cores, estoque, novidades, destaques ou avaliações reais preenchidos por padrão.

## Gestão e dados

O painel `gestao.html` guarda catálogo, estoque e pedidos no `localStorage` do navegador atual. Ele não sincroniza com aparelhos diferentes e não é protegido por autenticação. Como o site é público no GitHub Pages, não use esse painel com pedidos ou dados reais de clientes até conectá-lo a um backend autenticado e compartilhado.

Os valores de produto são demonstrativos. O site não calcula frete: a região atendida, disponibilidade, valor de entrega, preço e variantes são confirmados diretamente com a loja pelo WhatsApp. O endereço completo de retirada e políticas de troca não foram informados no projeto.

## Configurar o catálogo

Edite cada produto em `catalog-data.js`. Os campos opcionais são `images` (array para fotos adicionais), `sizes`, `colors`, `sku`, `stock`, `tag`, `new` e `featured`. Deixe campos sem confirmação vazios ou ausentes. As medidas do guia ficam em `window.DonnaSizeGuide.measurements`, organizadas por tamanho e pelas chaves `Busto`, `Cintura` e `Quadril`; sem dados preenchidos, o guia exibe traços.

O cadastro pelo painel funciona apenas no navegador onde o produto foi criado. Imagens adicionadas ali ficam como dados locais do navegador, não são enviadas ao repositório ou disponibilizadas aos demais visitantes.
