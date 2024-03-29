const formNewPost = document.querySelector('.formNewPost');

const title = document.querySelector('.formNewPost .title');
const publication = document.querySelector('.formNewPost .publication');

const imageButton = document.querySelector('.formNewPost .button1');
const inputFile = document.querySelector('#addImage');

const h2Elements = document.querySelectorAll('.postsrecents h2.article');
const elementosPost = document.querySelectorAll('.descriptionPost');

const updateImageButton = document.getElementById("updateImageBtn")
const updateTextButton = document.getElementById("updateTextBtn")
const confirmButton = document.getElementById("confirmBtn")
const deleteButton = document.getElementById('deleteBtn');

const updateFile = document.querySelector('#updateImage');

const url = 'http://localhost:4000';

let postAtual = {
    id: null,
    title: null,
    description: null,
    image: null
};

let oldImage = null;
let oldTitle = null;
let oldDesc = null;


//Funções de busca
async function fetchData() {
    try {
        const response = await fetch(`${url}/post/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Erro ao buscar posts: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        throw error;
    }
}

async function getPost(title) {
    try {
        const posts = await fetchData();
        if (title) {
            const post = posts.find((post) => {
                 return post.title == title 
            });
            return post;
        }
        return null;
    } catch (e) {
        console.log(e.mesage);
    }
}

async function getRecentes(unless) {
    try {
        const recentes = await fetchData();
        if(unless){
            const index = recentes.findIndex(element => element.title == unless)
            if(index != -1){
                recentes.splice(index, 1);
            }
        }


        return recentes.slice(0, 4);
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        throw error;
    }
}

//Atualizar
async function atualizarPostAtual(title) {
    try {
        let post = await getPost(postAtual.title);

        if(title) {
            post = await getPost(title);
            console.log("o argumento titulo recebido foi", title);
        }
        
        postAtual.id = post.id;
        postAtual.title = post.title;
        postAtual.description = post.description;
        postAtual.image = post.Fotos[0];
        
        oldImage = post.Fotos[0];
        oldTitle = post.title;
        oldDesc = post.description;
        console.log("Foto atual : ", oldImage);
        } catch (error) {
            console.error('Erro ao buscar o post:', error);
        }

}

// Função para atualizar o post no banco de dados com as novas informações
async function atualizarPost() {
  try {
    const title = document.querySelector('.descriptionPost .titlePost');
    const description = document.querySelector('.descriptionPost .contentPost');
    // Atualiza o post no banco de dados usando as informações armazenadas em postAtual
    await fetch(`${url}/post/${postAtual.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title.textContent,
        description: description.textContent,
      })
    });

    // Atualiza a imagem do post, se houver alterações
    if (oldImage !== postAtual.image) {
        
        const formData = new FormData();
        formData.append('foto', oldImage);
        formData.append('post_id', postAtual.id);

        await fetch(`${url}/photo`, {
            method: 'POST',
            body: formData
        });

    }

    // Atualiza o conteúdo da página com o post atualizado
    await updateContent();
    alert('Post atualizado com sucesso!');
    console.log(postAtual.id, postAtual.title);
  } catch (error) {
    console.error('Erro ao atualizar o post:', error);
  }
}

async function deletarPost() {
    try {
      // Realiza a solicitação DELETE para remover o post do banco de dados
      await fetch(`${url}/post/${postAtual.id}`, {
        method: 'DELETE'
      });
  
      // Realiza a solicitação DELETE para remover a imagem do post do banco de dados
      await fetch(`${url}/photo/${postAtual.id}`, {
        method: 'DELETE'
      });
      
      const proximo = await getRecentes();
      await atualizarPostAtual(proximo[0].title);
      await updateContent();
      // Atualiza o conteúdo da página após deletar o post
      alert('Post deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar o post:', error);
    }
}
  

// Função para lidar com a seleção de uma nova imagem para o post
function handleImageSelection(input) {
  const arquivo = input.files[0];
  if (arquivo) {
    oldImage = arquivo; // Armazena a nova imagem na variavel
    if(input === updateFile){
        const preview = document.getElementById('preview');
        preview.innerHTML = '';
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.maxWidth = '200px'; // Define o tamanho máximo da imagem na pré-visualização
            img.style.borderRadius = '10px'; 
            preview.style.display = 'flex';
            preview.style.justifyContent = 'center';
            preview.appendChild(img);
        }

        reader.readAsDataURL(arquivo);
        

        buttonState()
    }
  }
}

async function updateContent() {
    try {
        const recente = await getRecentes();
        let postExibido = recente[0];
        
        if (postAtual.title !== null){
            postExibido = await getPost(postAtual.title);
        }
        console.log("Esse é o post: ", postExibido);
        postAtual.id = postExibido.id;
        postAtual.title = postExibido.title;
        postAtual.description = postExibido.description;
        postAtual.image = postExibido.Fotos[0];
    
        // Atualiza os elementos HTML com as informações do post
        const titleElement = document.querySelector('.descriptionPost h1');
        titleElement.textContent = postAtual.title;
    
        const publicationElement = document.querySelector('.descriptionPost .contentPost');
        publicationElement.textContent = postAtual.description;
    
        const imageElement = document.querySelector('.descriptionPost img');
        imageElement.setAttribute('src', postAtual.image.url);
    
        // Atualiza os elementos HTML com os títulos dos posts recentes
        const h2Elements = document.querySelectorAll('.postsrecents h2.article');
        recente.slice(1).forEach((element, index) => {
          h2Elements[index].textContent = element.title;
        });
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      }

      atualizarPostAtual();

}

function buttonState(state) {
    const botao = document.querySelector('.button3');
    if(state){
        botao.style.display = state;
    }else {
        if(botao.style.display === 'none'){
            botao.style.display = 'flex';
        }else{
            botao.style.display = 'none';
        }
    }
}

function handleTextEdit(visible = true) {
    const title = document.querySelector('.descriptionPost .titlePost');
    const content = document.querySelector('.descriptionPost .contentPost');

    title.contentEditable = visible;
    content.contentEditable = visible;
}





inputFile.setAttribute("onchange", "handleImageSelection(inputFile)");
updateFile.setAttribute("onchange", "handleImageSelection(updateFile)");
  
formNewPost.addEventListener('submit', async function(event) {
    event.preventDefault();

    const titleValue = title.value;
    const publicationValue = publication.value;

    const imageValue = inputFile.files?.[0];
    
    if (!titleValue || !publicationValue) {
        alert('Preencha todos os campos');
        return;
    }

    if (!imageValue) {
        alert('Adicione uma imagem');
        return;
    }
    
    try {
        const data = await fetch(`${url}/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title: titleValue, description: publicationValue})
        });
    
        const response = await data.json();
        
        const id = response.id;

        const formDataImage = new FormData();
        formDataImage.append('foto', imageValue);
        formDataImage.append('post_id', id);

        const dataImage = await fetch(`${url}/photo`, {
            method: 'POST',
            body: formDataImage
        });

        title.value = '';
        publication.value = '';

        alert('Post criado com sucesso!');
        await atualizarPostAtual(response.title)
        updateContent();

    } catch (e) {
        console.log(e);
    }
});

h2Elements.forEach((h2) => {
    h2.addEventListener('click', async () => {
        const next = await getPost(h2.textContent);
        const nextPosts = await getRecentes(h2.textContent);
        const title = document.querySelector('.descriptionPost h1')
        title.textContent = next.title;
    
        const publication = document.querySelector('.descriptionPost .contentPost');
        publication.textContent = next.description;
    
        const imagePost = document.querySelector('.descriptionPost img');
        imagePost.setAttribute('src', next.Fotos[0]['url']);
    
        h2Elements.forEach((element, index) => {
            element.textContent = nextPosts[index].title; // 
        });

        preview.innerHTML = '';
        atualizarPostAtual(next.title)
        handleTextEdit(false);
        buttonState("none");
    });
});

imageButton.addEventListener('click', function() {
    inputFile.click();
});

updateImageButton.addEventListener('click', () => {
    updateFile.click();
    console.log('Updated image');
});

updateTextButton.addEventListener('click', async () => {
    handleTextEdit();
    buttonState("flex");
});

confirmButton.addEventListener('click', async () => {
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
    buttonState();
    handleTextEdit(false);
    atualizarPost();
});

deleteButton.addEventListener('click', () => {
    deletarPost();
     
});

updateContent();

