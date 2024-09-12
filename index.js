const { select, input , checkbox} = require('@inquirer/prompts')
const { readFile } = require('fs')
const fs = require("fs").promises

let mensagem = "Bem vindo ao app de Metas"

let metas 

const carregarMetas = async () =>{
    try{
        const dados =  await fs.readFile("metas.json", "utf-8")
        metas = JSON.parse(dados)
    }
    catch(erro) {
        metas = []
    }
}

const salvarMetas = async () => {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async () => {
    const meta = await input({message: "Digite a meta:"})

    if(meta.length == 0) {
        mensagem = "A meta nao pode ser vazia."
        return
    }
    metas.push({ value: meta, checked: false})
    
    mensagem = "Meta cadastrada com sucesso"
}

const listarMetas = async () => {
    if(metas.length == 0){
        mensagem = "Nenhuma meta cadastrada :("
        return
    }

    const respostas = await checkbox({
        message: "Use as setas para mudar de meta, o espaco para marcar ou desmarcar e o Enter para finalizar essa etapa",
        choices: [...metas],
        instructions: false
    })

    metas.forEach((m) =>{
        m.checked = false
    })

    if(respostas.length == 0) {
        mensagem = "Nenhuma meta selecionada"
        return
    }

    respostas.forEach((resposta) => {
        const meta = metas.find((m) => {
            return m.value == resposta
        })

        meta.checked = true
    })
    mensagem = 'Meta(s) marcada(s) como concluida(s)'
}

const metasRealizadas = async () => {
    if(metas.length == 0){
        mensagem = "Nenhuma meta cadastrada :("
        return
    }

    const realizadas = metas.filter((meta) => {
        return meta.checked
    })
    if(realizadas.length == 0) {
        mensagem = 'Nao existem metas realizadas :('
        return
    }

    await select({
        message: "Metas realilzadas: " + realizadas.length,
        choices:[...realizadas]
    })
}

const metasAbertas = async () => {
    if(metas.length == 0){
        mensagem = "Nenhuma meta cadastrada :("
        return
    }

    const abertas = metas.filter((meta)=>{
        return meta.checked != true
    })

    if(abertas.length == 0){
        mensagem = "Nao existem metas abertas :)"
        return
    }

    await select({
        message:"Metas Abertas: " + abertas.length,
        choices:[...abertas]
    })
}

const deletarMetas = async () => {
    if(metas.length == 0){
        mensagem = "Nenhuma meta cadastrada :("
        return
    }
    
    const metasDesmarcadas = metas.map((meta)=>{
        return {value: meta.value, checked: false}
    })
    const itemsADeletar = await checkbox({
        message: "Selecione item para deletar",
        choices: [...metasDesmarcadas],
        instructions: false
    })
    if(itemsADeletar == 0){
        mensagem = "Nenhum item para deletar"
        return
    }
    itemsADeletar.forEach((item) => {
        metas = metas.filter((meta) => {
            return meta.value != item
        })
    })
    mensagem = "Meta(s) deletada(s) com sucesso"

}

const mostrarMensagem = () => {
    console.clear();

    if(mensagem != ""){
        console.log(mensagem)
        console.log("")
        mensagem = ""
    }
}

async function start() {
    await carregarMetas()

    while(true){
        await salvarMetas()
        mostrarMensagem()

        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar meta",
                    value: "cadastrar"
                },
                {
                    name: "Listar metas",
                    value: "listar"
                },
                {
                    name: "Metas Realizadas",
                    value: "realizadas"
                },
                {
                    name: "Metas Abertas",
                    value: "abertas"
                },
                {
                    name: "Deletar Metas",
                    value: "deletar"
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })

        switch(opcao) {
            case "cadastrar":
                await cadastrarMeta()
                break
            case "listar":
                await listarMetas()
                break
            case "realizadas":
                await metasRealizadas()
                break
            case "abertas":
                await metasAbertas()
                break
            case "deletar":
                await deletarMetas()
                break
            case "sair":
                console.log("Ate a proxima")
                return
        }
    }
}

start()