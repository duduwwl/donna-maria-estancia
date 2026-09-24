# Donna Maria — loja virtual

Loja estática, responsiva e sem dependências de build. `index.html` é a página inicial, `produtos.html` tem o catálogo e `gestao.html` abre o painel de administração. Publique a pasta inteira sob a mesma origem em uma hospedagem com HTTPS. A consulta de CEP usa o serviço ViaCEP e requer internet e uma página servida por HTTP/HTTPS.

## Conteúdo

- Catálogo demonstrativo com categorias, busca, ordenação, favoritos e tamanhos selecionáveis.
- Sacola salva no navegador e checkout com retirada ou entrega, CEP nacional e escolha de Pix/crédito/débito.
- Finalização encaminhada ao WhatsApp **(79) 99652-0909**; nenhuma cobrança é processada neste site.
- Painel para acompanhar pedidos que chegaram pelo mesmo navegador, editar estoque, cadastrar e excluir produtos.
- Fotografias recortadas dos materiais enviados para este projeto; as imagens mantêm os cenários originais.

## Confirme antes de publicar como loja operacional

Os preços, etiquetas, descrições, grade de tamanhos e disponibilidade no catálogo são demonstrativos. As imagens permitem reconhecer os looks, mas não fornecem preços ou estoque. O fundo branco foi aplicado ao palco dos cards; os cenários que aparecem dentro das fotos originais não foram removidos. O frete por UF também é apenas uma estimativa fixa, não uma cotação dos Correios ou de transportadora. Para uma operação real, substitua os dados de exemplo, confirme o endereço completo de retirada e conecte um provedor de pagamento e uma API de frete.

O painel salva produtos, pedidos e estoque no `localStorage` do navegador. Isso permite testar o fluxo entre páginas nesse dispositivo; não sincroniza automaticamente dados de clientes em outros aparelhos e não é uma área autenticada. Antes de abrir o site ao público, ligue o painel a um backend com autenticação e banco de dados compartilhado.

O perfil fornecido identifica `@donnamaria132`, a cidade de Estância–SE, entrega grátis no Centro de Estância e o WhatsApp indicado acima. O endereço completo da loja não estava visível no material.
