const canvas = document.getElementById('sortingCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const numBlocks = 10;
const blockWidth = width / (numBlocks + 1); // Extra space for separation
const blockHeight = 50;
const blockSpacing = 15;
let blocks = Array.from({ length: numBlocks }, () => Math.floor(Math.random() * 100));

// Generate distinct colors for each block
const colors = blocks.map(() => `hsl(${Math.random() * 360}, 100%, 70%)`);

function drawBlock(x, y, width, height, color, value) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, x + width / 2, y + height / 2);
}

function drawBlocks(blocks, highlightIndices = [], conditionText = '', conditionResult = '') {
    ctx.clearRect(0, 0, width, height);
    
    // Draw condition text
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(conditionText, width / 2, 50);
    ctx.fillStyle = conditionResult === 'True' ? 'green' : 'red';
    ctx.fillText(conditionResult, width / 2, 80);
    
    for (let i = 0; i < blocks.length; i++) {
        const blockX = (i + 1) * blockWidth - blockWidth / 2; // Center blocks
        const blockY = height / 2 - blockHeight / 2;
        const color = highlightIndices.includes(i) ? 'red' : colors[i];
        drawBlock(blockX, blockY, blockWidth - blockSpacing, blockHeight, color, blocks[i]);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateSwap(blocks, i, j) {
    const steps = 20;
    const blockX1 = (i + 1) * blockWidth - blockWidth / 2;
    const blockX2 = (j + 1) * blockWidth - blockWidth / 2;
    const blockY = height / 2 - blockHeight / 2;
    const blockUpY = blockY - 50;
    const blockDownY = blockY + 50;
    
    for (let step = 0; step <= steps; step++) {
        const progress = step / steps;
        const x1 = blockX1 + (blockX2 - blockX1) * progress;
        const y1 = blockY - (blockY - blockUpY) * Math.sin(Math.PI * progress);
        const x2 = blockX2 - (blockX2 - blockX1) * progress;
        const y2 = blockY + (blockDownY - blockY) * Math.sin(Math.PI * progress);
        
        ctx.clearRect(0, 0, width, height);
        for (let k = 0; k < blocks.length; k++) {
            if (k === i) {
                drawBlock(x1, y1, blockWidth - blockSpacing, blockHeight, colors[i], blocks[i]);
            } else if (k === j) {
                drawBlock(x2, y2, blockWidth - blockSpacing, blockHeight, colors[j], blocks[j]);
            } else {
                const blockX = (k + 1) * blockWidth - blockWidth / 2;
                const blockY = height / 2 - blockHeight / 2;
                drawBlock(blockX, blockY, blockWidth - blockSpacing, blockHeight, colors[k], blocks[k]);
            }
        }
        await sleep(25);
    }
    
    let temp = blocks[i];
    blocks[i] = blocks[j];
    blocks[j] = temp;
    drawBlocks(blocks);
    await sleep(200);
}

async function animateInsertion(blocks, fromIndex, toIndex, key) {
    const steps = 20;
    const initialX = (fromIndex + 1) * blockWidth - blockWidth / 2;
    const finalX = (toIndex + 1) * blockWidth - blockWidth / 2;
    const initialY = height / 2 - blockHeight / 2;
    const upY = initialY - 50;

    for (let step = 0; step <= steps; step++) {
        const progress = step / steps;
        const x = initialX + (finalX - initialX) * progress;
        const y = initialY - (initialY - upY) * Math.sin(Math.PI * progress);

        ctx.clearRect(0, 0, width, height);
        for (let k = 0; k < blocks.length; k++) {
            const blockX = (k + 1) * blockWidth - blockWidth / 2;
            const blockY = height / 2 - blockHeight / 2;
            const color = colors[k];
            if (k === fromIndex) {
                drawBlock(x, y, blockWidth - blockSpacing, blockHeight, color, key);
            } else {
                drawBlock(blockX, blockY, blockWidth - blockSpacing, blockHeight, color, blocks[k]);
            }
        }
        await sleep(25);
    }
}

async function bubbleSort(blocks) {
    let len = blocks.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            const conditionText = `${blocks[j]} > ${blocks[j + 1]}`;
            const conditionResult = blocks[j] > blocks[j + 1] ? 'True' : 'False';
            drawBlocks(blocks, [j, j + 1], conditionText, conditionResult);
            await sleep(500); // Highlight the blocks being compared
            if (blocks[j] > blocks[j + 1]) {
                await animateSwap(blocks, j, j + 1);
            }
        }
    }
    drawBlocks(blocks); // Draw the final sorted state
}

async function selectionSort(blocks) {
    let len = blocks.length;
    for (let i = 0; i < len - 1; i++) {
        let minIdx = i;
        
        // Highlight the current minimum index in blue
        drawBlocks(blocks, [minIdx], `Finding minimum element from index ${i}`, '');
        await sleep(1000);
        
        for (let j = i + 1; j < len; j++) {
            // Highlight the current element being compared in yellow
            drawBlocks(blocks, [minIdx, j], `Comparing ${blocks[minIdx]} with ${blocks[j]}`, '');
            await sleep(500);
            
            if (blocks[j] < blocks[minIdx]) {
                // Update minimum index and highlight it in blue
                minIdx = j;
                drawBlocks(blocks, [minIdx], `Found new minimum element at index ${minIdx}`, '');
                await sleep(500);
            }
        }
        
        if (minIdx !== i) {
            // Perform swap animation
            drawBlocks(blocks, [minIdx, i], `Swapping ${blocks[minIdx]} with ${blocks[i]}`, '');
            await animateSwap(blocks, i, minIdx);
        } else {
            // No swap needed, show message
            drawBlocks(blocks, [], `No swap needed for index ${i}`, '');
            await sleep(1000);
        }
    }
    
    // Sorting is complete, show final state
    drawBlocks(blocks, [], 'Sorting completed', '');
}

async function insertionSort(blocks) {
    let len = blocks.length;
    for (let i = 1; i < len; i++) {
        let key = blocks[i];
        let j = i - 1;
        
        while (j >= 0 && blocks[j] > key) {
            const conditionText = `${blocks[j]} > ${key}`;
            const conditionResult = 'True';
            drawBlocks(blocks, [j, j + 1], conditionText, conditionResult);
            await sleep(500); // Highlight the blocks being compared
            blocks[j + 1] = blocks[j];
            j = j - 1;
        }
        
        await animateInsertion(blocks, i, j + 1, key);
        blocks[j + 1] = key;
        drawBlocks(blocks); // Draw intermediate steps
        await sleep(500);
    }
    drawBlocks(blocks); // Draw the final sorted state
}

async function quickSort(blocks, left = 0, right = blocks.length - 1) {
    if (left < right) {
        let pivotIndex = await partition(blocks, left, right);
        await quickSort(blocks, left, pivotIndex - 1);
        await quickSort(blocks, pivotIndex + 1, right);
    }
}

async function partition(blocks, left, right) {
    let pivot = blocks[right];
    let i = left - 1;
    for (let j = left; j < right; j++) {
        const conditionText = `${blocks[j]} < ${pivot}`;
        const conditionResult = blocks[j] < pivot ? 'True' : 'False';
        drawBlocks(blocks, [j, right], conditionText, conditionResult);
        await sleep(500);
        if (blocks[j] < pivot) {
            i++;
            await animateSwap(blocks, i, j);
        }
    }
    await animateSwap(blocks, i + 1, right);
    return i + 1;
}

async function mergeSort(blocks, left = 0, right = blocks.length - 1) {
    if (left < right) {
        let mid = Math.floor((left + right) / 2);
        await mergeSort(blocks, left, mid);
        await mergeSort(blocks, mid + 1, right);
        await merge(blocks, left, mid, right);
    }
}

async function merge(blocks, left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;
    let leftArray = new Array(n1);
    let rightArray = new Array(n2);
    for (let i = 0; i < n1; i++) {
        leftArray[i] = blocks[left + i];
    }
    for (let j = 0; j < n2; j++) {
        rightArray[j] = blocks[mid + 1 + j];
    }
    let i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        const conditionText = `${leftArray[i]} <= ${rightArray[j]}`;
        const conditionResult = leftArray[i] <= rightArray[j] ? 'True' : 'False';
        drawBlocks(blocks, [], conditionText, conditionResult);
        await sleep(500);
        if (leftArray[i] <= rightArray[j]) {
            blocks[k] = leftArray[i];
            i++;
        } else {
            blocks[k] = rightArray[j];
            j++;
        }
        k++;
    }
    while (i < n1) {
        blocks[k] = leftArray[i];
        i++;
        k++;
    }
    while (j < n2) {
        blocks[k] = rightArray[j];
        j++;
        k++;
    }
    drawBlocks(blocks); // Draw intermediate steps
    await sleep(500);
}

function visualizeSort(algorithm) {
    blocks = Array.from({ length: numBlocks }, () => Math.floor(Math.random() * 100));
    switch (algorithm) {
        case 'bubbleSort':
            bubbleSort(blocks);
            break;
        case 'selectionSort':
            selectionSort(blocks);
            break;
        case 'insertionSort':
            insertionSort(blocks);
            break;
        case 'quickSort':
            quickSort(blocks);
            break;
        case 'mergeSort':
            mergeSort(blocks);
            break;
        default:
            break;
    }
}