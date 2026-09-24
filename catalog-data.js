(()=>{
  const defaults=[
    {id:'rosa',name:'Vestido Rosa Encanto',category:'Vestidos',image:'vestido-rosa.jpg',price:149.90,old:179.90,tag:'Queridinho',sizes:['P','M','G','GG'],description:'Vestido rosa com recortes e caimento marcante — um look cheio de presença para os seus momentos especiais.'},
    {id:'lilas',name:'Vestido Lavanda',category:'Vestidos',image:'vestido-lilas.jpg',price:129.90,tag:'Novidade',sizes:['P','M','G','GG'],description:'Silhueta delicada em tom lavanda, com shape ajustado e visual leve para celebrar a sua feminilidade.'},
    {id:'vermelho',name:'Vestido Rubi',category:'Vestidos',image:'vestido-vermelho.jpg',price:139.90,sizes:['P','M','G','GG'],description:'Vermelho vibrante e modelagem que acompanha o corpo: a escolha certa quando você quer chegar chegando.'},
    {id:'preto',name:'Conjunto Risca de Giz',category:'Conjuntos',image:'look-preto.jpg',price:169.90,tag:'Versátil',sizes:['P','M','G','GG'],description:'Conjunto preto com risca de giz, para montar uma produção elegante com personalidade.'},
    {id:'jeans',name:'Conjunto Jeans Cool',category:'Jeans',image:'conjunto-jeans.jpg',price:189.90,tag:'Mais amado',sizes:['P','M','G','GG'],description:'Jeans com atitude e detalhes que deixam a produção casual muito mais interessante.'},
    {id:'croche',name:'Conjunto Crochê Areia',category:'Conjuntos',image:'conjunto-croche.jpg',price:179.90,sizes:['P','M','G','GG'],description:'Textura artesanal em tom areia para um visual natural, delicado e cheio de charme.'},
    {id:'alongado',name:'Vestido Vermelho Donna',category:'Vestidos',image:'vestido-alongado.jpg',price:149.90,tag:'Destaque',sizes:['P','M','G','GG'],description:'Um vermelho intenso com decote alongado e caimento elegante para ocasiões que pedem um look especial.'},
    {id:'azul',name:'Vestido Azul Horizonte',category:'Vestidos',image:'vestido-azul.jpg',price:159.90,sizes:['P','M','G','GG'],description:'Azul luminoso em uma peça longa que transforma a produção em um instante.'},
    {id:'estampado',name:'Conjunto Floral Azul',category:'Conjuntos',image:'conjunto-estampado.jpg',price:169.90,tag:'Novo',sizes:['P','M','G','GG'],description:'Estampa azul e branca com top e calça coordenados — frescor e estilo no mesmo look.'},
    {id:'amarelo',name:'Conjunto Solar',category:'Conjuntos',image:'conjunto-amarelo.jpg',price:169.90,tag:'Edição especial',sizes:['P','M','G','GG'],description:'Amarelo alegre, estampa floral e shape moderno para deixar qualquer dia mais colorido.'}
  ];
  const clone=data=>JSON.parse(JSON.stringify(data));let memory=clone(defaults);
  function store(items){memory=clone(items);try{localStorage.setItem('donna-products',JSON.stringify(items))}catch{}}
  window.DonnaCatalog={defaults,load(){try{const stored=JSON.parse(localStorage.getItem('donna-products'));if(Array.isArray(stored)){memory=stored;return clone(stored)}}catch{}return clone(memory)},save(items){store(items)},reset(){store(defaults);return clone(defaults)}};
})();
