const form = document.querySelector('form');
const text = document.querySelector('input[type=text]');
const number = document.querySelector('input[type=number]');
const ignoreZwnjCheckbox = document.querySelector('#zwnj-checkbox');
const tbody = document.querySelector('tbody');
const messageContainer = document.querySelector('#message');
const article = document.querySelector('article');
const scriptWithBreakLinesContainer = document.querySelector('#script-with-breaklines');
const minimumNumberOfLinesContainer = document.querySelector('#minimum-number-of-lines');

const zwnj = '‌';
const space = ' ';

form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Input values
  let script = text.value.trim().replace(/  +/g, space);
  const maximumCharactersPerLine = number.value;

  // Other values
  let minimumNumberOfLines = 0;
  let subScript = '';
  let subScriptLength = 0;
  let zwnjCounter = 0;
  let validationFlag = true;
  let scriptUpToTheFirstSpaceAfterZwnj = '';
  let scriptWithBreakLines = '';

  article.classList.add('hidden');

  // If there is no script, and there is no maximum amount of characters set
  if (!script && !maximumCharactersPerLine) {
    writeMessage('Fill both forms!');
  }

  // If there is script, but there is no maximum amount of characters set
  else if (script && !maximumCharactersPerLine) {
    writeMessage('Enter the maximum number of characters!');
  }

  // If there is no script, but the maximum amount of characters is there
  else if (!script && maximumCharactersPerLine) {
    writeMessage('Enter your script!');
  }

  // If there is script, with the maximum amount of characters
  else {
    tbody.innerHTML = '';
    tbody.classList.remove('bg-teal-800', 'bg-red-600', 'bg-gray-500');

    const scriptArray = script.split(space);

    for (let i = 0; i < scriptArray.length; i++) {
      let word = '';

      if (ignoreZwnjCheckbox.checked) {
        word = scriptArray[i].replaceAll(zwnj, '');
      }
      else {
        word = scriptArray[i];
      }

      if (word.length > maximumCharactersPerLine) {
        validationFlag = false;
        writeMessage('You reached the character limit!');
        tbody.classList.add('bg-red-600');
        addSubScriptToTheTable('-', scriptArray[i], word.length);
      }
    }

    // If every word is alright
    if (validationFlag) {
      tbody.classList.add('bg-teal-800');
      
      // Add a space to the end of the script
      script += space;

      // Analyze the script
      for (let i = 0; i < script.length; i++) {
        let character = script[i];

        if (ignoreZwnjCheckbox.checked) {
          if (character == zwnj) {
            zwnjCounter++;
            
            for (let j = i; j < script.length; j++) {
              if (script[j] == space) {
                scriptUpToTheFirstSpaceAfterZwnj = script.substring(0, j);
                break;
              }
            }

            const scriptUpToTheFirstSpaceAfterZwnjRealLength = scriptUpToTheFirstSpaceAfterZwnj.replaceAll(zwnj, '');

            if (scriptUpToTheFirstSpaceAfterZwnjRealLength.length > maximumCharactersPerLine) {
              zwnjCounter--;
              scriptUpToTheFirstSpaceAfterZwnj = '';
            }
          }
        }

        if (character == space) {
          const wordsWithoutTheLastSpace = script.substring(0, i);
          const wordsWithTheLastSpace = script.substring(0, i + 1);

          // With/without space => within the limit
          if (wordsWithTheLastSpace.length - zwnjCounter == maximumCharactersPerLine || wordsWithoutTheLastSpace.length - zwnjCounter == maximumCharactersPerLine) {
            minimumNumberOfLines++;
            subScript = wordsWithoutTheLastSpace;
            subScriptLength = subScript.length - zwnjCounter;
            addSubScriptToTheTable(minimumNumberOfLines, subScript, subScriptLength);
            scriptWithBreakLines += `<p class="h-6 flex justify-center items-center">${subScript}</p>`;
            script = script.substring(i + 1, script.length);
            i = 0;
            zwnjCounter = 0;
          }

          // Without space => above the limit
          else if (wordsWithoutTheLastSpace.length - zwnjCounter > maximumCharactersPerLine) {
            let index = - 1;
            for (let j = 0; j < wordsWithoutTheLastSpace.length; j++) {
              if (wordsWithoutTheLastSpace[j] == space) {
                index = j;
              }
            }
            minimumNumberOfLines++;
            subScript = script.substring(0, index);
            subScriptLength = subScript.length - zwnjCounter;
            addSubScriptToTheTable(minimumNumberOfLines, subScript, subScriptLength);
            scriptWithBreakLines += `<p class="h-6 flex justify-center items-center">${subScript}</p>`;
            script = script.substring(index + 1, script.length);
            i = 0;
            zwnjCounter = 0;
          }
        }

        // Final check
        if (i == script.length - 1) {
          minimumNumberOfLines++;
          subScript = script.trim();
          if (subScript.length != 0) {
            subScriptLength = subScript.length - zwnjCounter;
            addSubScriptToTheTable(minimumNumberOfLines, subScript, subScriptLength);
            scriptWithBreakLines += `<p class="h-6 flex justify-center items-center">${subScript}</p>`;
          }
        }
      }
    }
  }

  // Success message
  if (minimumNumberOfLines) {
    writeMessage('Thank you for choosing Line Blaster!');
    scriptWithBreakLinesContainer.innerHTML = scriptWithBreakLines;
    article.classList.remove('hidden');
    const minimumNumberOfLinesHexValue = (minimumNumberOfLines.toString(16).length == 1) ? `0${minimumNumberOfLines.toString(16)}` : minimumNumberOfLines.toString(16);
    minimumNumberOfLinesContainer.innerHTML = `Just <span class="cursor-pointer underline-offset-4 hover:underline" onclick="copy(this)" title="Copy">${minimumNumberOfLines}</span> (<span class="cursor-pointer underline-offset-4 hover:underline" onclick="copy(this)" title="Copy">${minimumNumberOfLinesHexValue}</span>) lines!`;
  }
});

const addSubScriptToTheTable = (lineNumber, subScript, subScriptLength) => {
  const lineNumberIsNumber = (typeof lineNumber == 'number') ? true : false;

  const lineNumberHexValue = (lineNumberIsNumber && lineNumber.toString(16).length == 1) ? `0${lineNumber.toString(16)}` : lineNumber.toString(16);

  tbody.insertAdjacentHTML('beforeend',
  `<tr class="h-8 hover:bg-gray-500 transition-colors">
    <td class="w-2/12 text-center border border-white overflow-auto">
      <p class="whitespace-nowrap">
        ${(lineNumberIsNumber) ? '#' : ''}${(lineNumberIsNumber) ? `<span class="cursor-pointer underline-offset-4 hover:underline" onclick="copy(this)" title="Copy">${lineNumber}</span>` : lineNumber} ${(lineNumberIsNumber) ? `[<span class="cursor-pointer underline-offset-4 hover:underline" onclick="copy(this)" title="Copy">${lineNumberHexValue}</span>]` : ''}
      </p>
    </td>
    <td class="w-8/12 text-center border border-white hover:bg-gray-400 transition-colors overflow-auto cursor-pointer" onclick="copy(this)" title="Copy">
      <p class="whitespace-nowrap">
        ${subScript}
      </p>
    </td>
    <td class="w-2/12 text-center border border-white overflow-auto">
      <p class="whitespace-nowrap">
        ${subScriptLength}
      </p>
    </td>
  </tr>`);
};

const copy = (element) => {
  const text = element.textContent.trim();
  navigator.clipboard.writeText(text);
};

const setPosition = (element) => {
  element.style.left = `${Math.round(Math.random() * 5)}px`;
  element.style.top = `${Math.round(Math.random() * 5)}px`;
}

const writeMessage = (message) => {
  // Hide message
  messageContainer.classList.remove('opacity-100');
  messageContainer.classList.add('opacity-0');

  setTimeout(() => {
    // Show message
    messageContainer.classList.remove('opacity-0');
    messageContainer.classList.add('opacity-100');

    // Add message
    messageContainer.textContent = message;
  }, 500);
};

writeMessage('Start blasting the lines!');