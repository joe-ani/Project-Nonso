// Custom Dropdown Logic
function setupCustomSelect(selectElementId) {
    const selectDiv = document.getElementById(selectElementId);
    const selected = selectDiv.querySelector('.select-selected');
    const itemsList = selectDiv.querySelector('.select-items');
    const items = itemsList.querySelectorAll('div');

    selected.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.classList.toggle('select-arrow-active');
        itemsList.classList.toggle('select-hide');
    });

    items.forEach(item => {
        item.addEventListener('click', function(e) {
            selected.innerHTML = this.innerHTML;
            selectDiv.dataset.value = this.dataset.value;
            selected.click(); // Close dropdown
        });
    });
}

function closeAllSelect(elmnt) {
    const selectedItems = document.getElementsByClassName("select-selected");
    const itemsLists = document.getElementsByClassName("select-items");
    for (let i = 0; i < selectedItems.length; i++) {
        if (elmnt !== selectedItems[i]) {
            selectedItems[i].classList.remove("select-arrow-active");
            itemsLists[i].classList.add("select-hide");
        }
    }
}

document.addEventListener("click", closeAllSelect);

setupCustomSelect('source-select');
setupCustomSelect('target-select');

// Swap Languages Logic
document.getElementById('swap-lang').addEventListener('click', () => {
    const sourceSelect = document.getElementById('source-select');
    const targetSelect = document.getElementById('target-select');
    
    const sourceVal = sourceSelect.dataset.value;
    const targetVal = targetSelect.dataset.value;

    let newSourceVal = targetVal;
    let newTargetVal = sourceVal;

    if (newTargetVal === 'auto') {
        return;
    }

    const sourceItems = sourceSelect.querySelectorAll('.select-items div');
    let sourceText = '';
    sourceItems.forEach(item => { if(item.dataset.value === newSourceVal) sourceText = item.innerHTML; });

    const targetItems = targetSelect.querySelectorAll('.select-items div');
    let targetText = '';
    targetItems.forEach(item => { if(item.dataset.value === newTargetVal) targetText = item.innerHTML; });

    if (sourceText && targetText) {
        sourceSelect.dataset.value = newSourceVal;
        sourceSelect.querySelector('.select-selected').innerHTML = sourceText;

        targetSelect.dataset.value = newTargetVal;
        targetSelect.querySelector('.select-selected').innerHTML = targetText;
    }

    const sourceTextarea = document.getElementById('source-text');
    const targetTextarea = document.getElementById('target-text');
    const tempText = sourceTextarea.value;
    sourceTextarea.value = targetTextarea.value;
    targetTextarea.value = tempText;
});

// MyMemory API Translation Logic
document.getElementById('translate-btn').addEventListener('click', async function() {
    const btn = this;
    const btnText = btn.querySelector('.btn-text');
    const sourceText = document.getElementById('source-text').value.trim();
    const targetTextarea = document.getElementById('target-text');
    const errorMsg = document.getElementById('error-message');
    
    const sourceLang = document.getElementById('source-select').dataset.value;
    const targetLang = document.getElementById('target-select').dataset.value;

    errorMsg.style.opacity = '0';

    if (!sourceText) return;

    btn.classList.add('loading');
    btnText.innerText = 'Translating...';

    try {
        const langPair = sourceLang === 'auto' ? `Autodetect|${targetLang}` : `${sourceLang}|${targetLang}`;
        
        const url = new URL('https://api.mymemory.translated.net/get');
        url.searchParams.append('q', sourceText);
        url.searchParams.append('langpair', langPair);

        const response = await fetch(url);
        const data = await response.json();

        if (data.responseStatus !== 200) {
            throw new Error(data.responseDetails || `API Error: ${data.responseStatus}`);
        }

        if (data.responseData && data.responseData.translatedText) {
            targetTextarea.value = data.responseData.translatedText;
        }

    } catch (err) {
        errorMsg.innerText = err.message || "Failed to translate.";
        errorMsg.style.opacity = '1';
    } finally {
        btn.classList.remove('loading');
        btnText.innerText = 'Translate';
    }
});

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Utilities Logic
const sourceTextareaUI = document.getElementById('source-text');
const targetTextareaUI = document.getElementById('target-text');
const charCountUI = document.getElementById('char-count');

sourceTextareaUI.addEventListener('input', () => {
    charCountUI.innerText = `${sourceTextareaUI.value.length} / 500`;
});

document.getElementById('clear-source').addEventListener('click', () => {
    sourceTextareaUI.value = '';
    targetTextareaUI.value = '';
    charCountUI.innerText = '0 / 500';
});

document.getElementById('copy-target').addEventListener('click', () => {
    if (!targetTextareaUI.value) return;
    navigator.clipboard.writeText(targetTextareaUI.value).then(() => {
        showToast('Copied to clipboard!');
    });
});

// Speech Synthesis
function speakText(text, langCode) {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
}

document.getElementById('listen-source').addEventListener('click', () => {
    let lang = document.getElementById('source-select').dataset.value;
    if (lang === 'auto') lang = 'en'; // fallback
    speakText(sourceTextareaUI.value, lang);
});

document.getElementById('listen-target').addEventListener('click', () => {
    const lang = document.getElementById('target-select').dataset.value;
    speakText(targetTextareaUI.value, lang);
});
