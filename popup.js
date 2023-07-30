

window.addEventListener('DOMContentLoaded', async () => {

    var { wordlist } = await chrome.storage.local.get(['wordlist'])

    var ul = document.getElementById('wordlist')

    console.log(wordlist)
    console.log(ul)

    wordlist.forEach(word => {
        var li = document.createElement('li')
        li.textContent = word.content
        const translation = document.createElement('button')
        translation.textContent = word.translation
        translation.className = 'translation'
        li.appendChild(translation)

        ul.appendChild(li)

        const del = document.createElement('button')
        li.appendChild(del)
        del.innerText = 'X'
        del.className = 'del'
        del.onclick = async () => {
            wordlist = wordlist.filter(w => w.content != word.content)
            await chrome.storage.local.set({ wordlist })
            li.remove()
        }

        //例句
        li.appendChild(document.createElement('br'))
        //li.appendChild(document.createTextNode("例句"))
    })


})