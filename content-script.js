const css = `
button {
    background-color: rgb(190, 235, 251);
    color: rgb(53, 54, 58);
    border: none;
    text-align: center;
    text-decoration: none;
    border-radius: 10px;
    margin: 0px 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-weight: bold;
    transition: all 0.2s ease -in -out;
}

`



async function GetWordlist() {
    var { wordlist } = await chrome.storage.local.get(['wordlist'])
    wordlist = wordlist || []
    return wordlist
}

async function AddOrModifyWord(word) {
    const wordlist = await GetWordlist()
    const index = wordlist.findIndex(item => item.content == word.content)
    if (index != -1) {
        wordlist[index] = word
    } else {
        wordlist.push(word)
    }
    await chrome.storage.local.set({ wordlist })

}


function ExpandCapsule(originText, word) {
    if (true) {
        // Shadow Root Mode
        const btn = $('<button>', {
            text: `🔄️`,
            class: 'translated-word-btn',
        });

        const $span = $("<span>", {
            class: 'translated-word'
        }).append(originText).append(btn)

        const span = $span[0]

        const capsule = document.createElement('span');
        capsule.attachShadow({ mode: 'open' })

        capsule.shadowRoot.append(span)

        const style = document.createElement('style')
        style.innerHTML = css
        capsule.shadowRoot.append(style);

        capsule.finish = async (word) => {
            btn.text(word.translation)
            btn.off('click').on('click', async () => {
                const text = prompt('修改为:', word.translation);
                if (text) {
                    word.translation = text;
                    AddOrModifyWord(word)
                    capsule.finish(word)
                }
            })
        }
        return capsule;
    }
}



function isEnglish(str) {
    const englishWordRegex = /^[A-Za-z\s]+$/;
    return englishWordRegex.test(str);
}

document.addEventListener('dblclick', async (event) => {
    var selection = window.getSelection()
    var selectedText = selection.toString().trim()
    const range = selection.getRangeAt(0)

    if (selectedText.length > 0 && range.startContainer == range.endContainer && range.startContainer.nodeType == 3 && selection.rangeCount == 1 && range.startContainer.parentNode.className != 'translated-word' && isEnglish(selectedText)) {
        {
            const originText = range.extractContents()

            const capsule = ExpandCapsule(originText);

            (async () => {
                const { word, result } = await chrome.runtime.sendMessage({
                    type: 'translate', word: {
                        content: selectedText,
                    }
                })
                if (result) {
                    AddOrModifyWord(word)
                }
                capsule.finish(word)

            })();

            range.insertNode(capsule)

            const newRange = document.createRange()

            //重新选中原文
            newRange.setStart(capsule.shadowRoot.childNodes[0].childNodes[0], 0)
            newRange.setEnd(capsule.shadowRoot.childNodes[0].childNodes[0], capsule.shadowRoot.childNodes[0].childNodes[0].length)
            window.getSelection().removeAllRanges()
            window.getSelection().addRange(newRange)
        }

    }
});

GetWordlist().then(wordlist => {
    function detectNode(node) {
        wordlist.forEach(word => {
            const regex = new RegExp(`\\b${word.content}\\b`, 'gi');
            const matches = node.nodeValue.match(regex);

            if (matches) {
                console.log(node.nodeValue)
                matches.forEach(match => {
                    const index = node.nodeValue.indexOf(match);

                    const _text = node.splitText(index)
                    const _null_text = _text.splitText(match.length)
                    const _text_ = _text.cloneNode(true)

                    const capsule = ExpandCapsule(_text_)

                    _text.parentNode.replaceChild(capsule, _text)
                    node = _null_text

                    capsule.finish(word)
                });
            }
        })
    }
    $('body :not(script)').contents().filter(function () {
        return this.nodeType === 3;
    }).each(function () {
        detectNode(this)
    })
}) 