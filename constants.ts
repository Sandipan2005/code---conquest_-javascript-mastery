

import { Curriculum, Challenge, SolutionCriteriaResult, MainTopic } from './types';

export const GAME_TITLE = "Code & Conquest";

// --- Default Placeholder Functions ---
const defaultSolutionCriteria = (conceptName: string): Challenge['solutionCriteria'] => () => ({
  passed: false,
  message: `The scrolls for "${conceptName}" are ancient and their full meaning is not yet deciphered in this game. Solution criteria pending.`,
});

const defaultDescription = (conceptName: string) => `Unravel the mysteries of ${conceptName}. Prove your understanding by weaving the correct spell.`;
const defaultStarterCode = (conceptName: string) => `// The Altar of ${conceptName} awaits your inscription...\n`;

// --- Re-usable Evaluation Logic (from original constants) ---
const evaluateCodeAndCheckVariable = (
  code: string,
  variableName: string,
  expectedType: string,
  expectedValue?: any
): SolutionCriteriaResult => {
  let result: SolutionCriteriaResult = { passed: false, message: "Evaluation failed." };
  try {
    const fullCode = code + `;\n typeof ${variableName} !== 'undefined' ? ${variableName} : undefined;`;
    // eslint-disable-next-line no-eval
    const value = eval(fullCode);

    if (typeof value === 'undefined') {
      result = { passed: false, message: `Halt, adventurer! The variable '${variableName}' has not been declared in this realm.` };
    } else if (typeof value !== expectedType) {
      result = { passed: false, message: `The fates decree '${variableName}' should be a ${expectedType}, but it appears as a mystical ${typeof value}!` };
    } else if (expectedValue !== undefined && value !== expectedValue) {
      result = { passed: false, message: `The ancient scrolls whisper that '${variableName}' should be ${JSON.stringify(expectedValue)}, yet your spell reveals ${JSON.stringify(value)}.` };
    } else {
      result = { 
        passed: true, 
        message: `Thy spell is true! '${variableName}' is correctly woven with the value ${JSON.stringify(value)}.`,
        evaluatedValue: value 
      };
    }
  } catch (e: any) {
    result = { passed: false, message: `A magical disturbance! Execution Error: ${e.message}. Check the runes of your syntax.` };
  }
  return result;
};

// --- Visual Feedback (from original constants, can be reused or adapted) ---
const createAnimatedVisualFeedback = (
  drawLogic: (
    ctx: CanvasRenderingContext2D,
    details: Parameters<NonNullable<Challenge['visualFeedback']>>[1],
    setAnimFrameId: (id: number | null) => void
  ) => void
): NonNullable<Challenge['visualFeedback']> => {
  let animationFrameId: number | null = null;

  return (canvas, details) => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawLogic(ctx, details, (id) => {
      animationFrameId = id;
    });
  };
};

const C1_1_VISUAL_FEEDBACK = createAnimatedVisualFeedback((ctx, details, setAnimFrameId) => {
  const canvas = ctx.canvas; const gameFont = "'VT323', monospace"; const titleFont = "'Cinzel Decorative', cursive";
  const hero = { x: 50, y: canvas.height / 2, size: 15, color: '#63b3ed', eyeColor: '#ffffff', name: 'Hero' };
  const target = { x: canvas.width - 70, y: canvas.height / 2, size: 25, color: '#f6ad55', symbol: '📜' };
  let heroMessage = ""; let heroMessageColor = "#e2e8f0"; let progress = 0; const animationDuration = 90; let currentFrame = 0;
  function drawHero(char:typeof hero){ctx.fillStyle=char.color;ctx.beginPath();ctx.arc(char.x,char.y,char.size,0,Math.PI*2);ctx.fill();ctx.fillStyle=char.eyeColor;ctx.beginPath();ctx.arc(char.x+char.size*0.3,char.y-char.size*0.2,char.size*0.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.font=`bold 12px ${gameFont}`;ctx.textAlign='center';ctx.fillText(char.name,char.x,char.y-char.size-5)}
  function drawTarget(){ctx.fillStyle=target.color;ctx.font=`${target.size*1.5}px ${gameFont}`;ctx.textAlign='center';ctx.fillText(target.symbol,target.x,target.y+target.size/2);ctx.font=`14px ${gameFont}`;ctx.fillText("Quest Scroll",target.x,target.y+target.size+10)}
  function drawBg(){ctx.fillStyle="#1a202c";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font=`bold 22px ${titleFont}`;ctx.fillStyle="#f6ad55";ctx.textAlign="center";ctx.fillText("The Hero's First Errand",canvas.width/2,40)}
  function animate(){currentFrame++;progress=Math.min(currentFrame/animationDuration,1);const easeOutProgress=1-Math.pow(1-progress,3);hero.x=50+(target.x-hero.size-50)*easeOutProgress;drawBg();drawTarget();drawHero(hero);ctx.font=`16px ${gameFont}`;ctx.fillStyle=heroMessageColor;ctx.textAlign="center";ctx.fillText(heroMessage,canvas.width/2,canvas.height-30);if(progress<1){setAnimFrameId(requestAnimationFrame(animate))}else{heroMessage=`Quest '${details.evaluatedValue}' accepted! Onwards!`;heroMessageColor="#68d391";drawBg();drawTarget();drawHero(hero);ctx.font=`bold 18px ${gameFont}`;ctx.fillStyle=heroMessageColor;ctx.textAlign="center";ctx.fillText(heroMessage,canvas.width/2,canvas.height-30);setAnimFrameId(null)}}
  drawBg();drawTarget();
  if(details.passed&&details.evaluatedValue==='The Lost Artifact'){heroMessage=`Hero: "My quest is '${details.evaluatedValue}'! I'm off!"`;heroMessageColor="#63b3ed";animate()}else{hero.x=50;drawHero(hero);if(details.passed===false){heroMessage=`Hero: "Hmm, that spell misfired... (${details.message?.substring(0,50)}...)"`;heroMessageColor="#e53e3e"}else{heroMessage="Hero: \"I need a 'questName' to begin!\"";heroMessageColor="#a0aec0"}ctx.font=`16px ${gameFont}`;ctx.fillStyle=heroMessageColor;ctx.textAlign="center";ctx.fillText(heroMessage,canvas.width/2,canvas.height-30);ctx.font=`italic 14px ${gameFont}`;ctx.fillStyle="#a0aec0";ctx.fillText("Instruct your hero: `let questName = 'The Lost Artifact';`",canvas.width/2,70)}
});
const C1_2_VISUAL_FEEDBACK = createAnimatedVisualFeedback((ctx,details,setAnimFrameId)=>{const canvas=ctx.canvas;const gameFont="'VT323', monospace";const titleFont="'Cinzel Decorative', cursive";const hero={x:canvas.width/2,y:canvas.height/2+30,size:20,color:'#63b3ed',eyeColor:'#fff',name:'Mage'};const crystal={x:canvas.width/2,y:100,baseSize:15,glowSize:0,color:'#81e6d9',maxGlow:15};let particles:{x:number,y:number,size:number,speedX:number,speedY:number,alpha:number,color:string}[]=[];let message="";let messageColor="#e2e8f0";let currentFrame=0;const animationDuration=120;
function drawHero(char:typeof hero,manaLevel:number){ctx.fillStyle=char.color;ctx.beginPath();ctx.arc(char.x,char.y,char.size,0,Math.PI*2);ctx.fill();ctx.fillStyle=char.eyeColor;ctx.beginPath();ctx.arc(char.x+char.size*0.3,char.y-char.size*0.2,char.size*0.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.font=`bold 12px ${gameFont}`;ctx.textAlign='center';ctx.fillText(char.name,char.x,char.y-char.size-15);const barWidth=50;const barHeight=8;ctx.strokeStyle='#a0aec0';ctx.strokeRect(char.x-barWidth/2,char.y-char.size-10,barWidth,barHeight);ctx.fillStyle='#4299e1';ctx.fillRect(char.x-barWidth/2,char.y-char.size-10,barWidth*manaLevel,barHeight)}
function drawCrystal(crys:typeof crystal){ctx.fillStyle=crys.color;ctx.beginPath();ctx.moveTo(crys.x,crys.y-crys.baseSize);ctx.lineTo(crys.x+crys.baseSize*0.8,crys.y);ctx.lineTo(crys.x,crys.y+crys.baseSize);ctx.lineTo(crys.x-crys.baseSize*0.8,crys.y);ctx.closePath();ctx.fill();if(crys.glowSize>0){const gradient=ctx.createRadialGradient(crys.x,crys.y,crys.baseSize*0.5,crys.x,crys.y,crys.baseSize+crys.glowSize);gradient.addColorStop(0,`rgba(129,230,217,0.7)`);gradient.addColorStop(1,`rgba(129,230,217,0)`);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(crys.x,crys.y,crys.baseSize+crys.glowSize,0,Math.PI*2);ctx.fill()}}
function createParticle(){return{x:crystal.x,y:crystal.y,size:Math.random()*3+1,speedX:(Math.random()-0.5)*2,speedY:Math.random()*1.5+0.5,alpha:1,color:`rgba(129,230,217,${Math.random()*0.5+0.5})`}}
function updateAndDrawParticles(){particles.forEach((p,index)=>{p.x+=p.speedX;p.y+=p.speedY;p.alpha-=0.015;if(p.alpha<=0||p.y>hero.y-hero.size){particles.splice(index,1)}else{ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}})}
function animatePowerUp(){currentFrame++;const progress=Math.min(currentFrame/animationDuration,1);const pulseProgress=Math.sin(progress*Math.PI);crystal.glowSize=crystal.maxGlow*pulseProgress;if(currentFrame%5===0&&particles.length<50&&progress<0.9){particles.push(createParticle())}ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#1a202c";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font=`bold 22px ${titleFont}`;ctx.fillStyle="#f6ad55";ctx.textAlign="center";ctx.fillText("The Mana Crystal",canvas.width/2,40);drawCrystal(crystal);updateAndDrawParticles();drawHero(hero,progress);ctx.font=`16px ${gameFont}`;ctx.fillStyle=messageColor;ctx.textAlign="center";ctx.fillText(message,canvas.width/2,canvas.height-30);if(progress<1){setAnimFrameId(requestAnimationFrame(animatePowerUp))}else{message="Mage: \"I feel the power of 100 Mana!\"";messageColor="#68d391";crystal.glowSize=crystal.maxGlow*0.5;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#1a202c";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font=`bold 22px ${titleFont}`;ctx.fillStyle="#f6ad55";ctx.textAlign="center";ctx.fillText("The Mana Crystal",canvas.width/2,40);drawCrystal(crystal);drawHero(hero,1);ctx.font=`bold 18px ${gameFont}`;ctx.fillStyle=messageColor;ctx.textAlign="center";ctx.fillText(message,canvas.width/2,canvas.height-30);setAnimFrameId(null)}}
ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#1a202c";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font=`bold 22px ${titleFont}`;ctx.fillStyle="#f6ad55";ctx.textAlign="center";ctx.fillText("The Mana Crystal",canvas.width/2,40);
if(details.passed&&details.evaluatedValue===100){message="Mage: \"The crystal hums with power! Charging...\"";messageColor="#81e6d9";animatePowerUp()}else{crystal.glowSize=0;particles=[];drawCrystal(crystal);drawHero(hero,0);if(details.passed===false){message=`Mage: "The crystal sputters... (${details.message?.substring(0,60)}...)"`;messageColor="#e53e3e"}else{message="Mage: \"This crystal needs maxMana set to 100 to awaken!\"";messageColor="#a0aec0"}ctx.font=`16px ${gameFont}`;ctx.fillStyle=messageColor;ctx.textAlign="center";ctx.fillText(message,canvas.width/2,canvas.height-30);ctx.font=`italic 14px ${gameFont}`;ctx.fillStyle="#a0aec0";ctx.fillText("Empower the Mage: `const maxMana = 100;`",canvas.width/2,70)}
});

const ARRAYS_VISUAL_FEEDBACK = createAnimatedVisualFeedback((ctx, details, setAnimFrameId) => {
  const canvas = ctx.canvas;
  const gameFont = "'VT323', monospace";
  const titleFont = "'Cinzel Decorative', cursive";
  ctx.fillStyle = "#1a202c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold 22px ${titleFont}`;
  ctx.fillStyle = "#f6ad55";
  ctx.textAlign = "center";
  ctx.fillText("The Royal Heist", canvas.width / 2, 40);

  const rogue = { x: canvas.width / 2, y: canvas.height - 50, size: 20, color: '#a0aec0', name: 'Rogue' };
  const chests = [
    { id: "Golden Scepter", x: canvas.width * 0.2, y: 120, open: false, collected: false, symbol: '👑' },
    { id: "Dragon's Eye Orb", x: canvas.width * 0.5, y: 120, open: false, collected: false, symbol: '🔮' },
    { id: "Sunstone Amulet", x: canvas.width * 0.8, y: 120, open: false, collected: false, symbol: '☀️' },
    // Decoys
    { id: "Rusty Dagger", x: canvas.width * 0.35, y: 200, open: false, collected: false, symbol: '🗡️' },
    { id: "Moldy Cheese", x: canvas.width * 0.65, y: 200, open: false, collected: false, symbol: '🧀' },
  ];
  const targetArtifacts = ["Golden Scepter", "Dragon's Eye Orb", "Sunstone Amulet"];
  let heistBag: string[] = Array.isArray(details.evaluatedValue) ? details.evaluatedValue : [];
  let rogueMessage = "Rogue: Ready for the heist!";
  let rogueMessageColor = "#e2e8f0";
  let currentTargetIndex = 0; // For animation

  function drawRogue() {
    ctx.fillStyle = rogue.color;
    ctx.beginPath();
    ctx.arc(rogue.x, rogue.y, rogue.size, 0, Math.PI * 2);
    ctx.fill();
    // Simple hood
    ctx.beginPath();
    ctx.moveTo(rogue.x - rogue.size * 0.8, rogue.y - rogue.size * 0.5);
    ctx.quadraticCurveTo(rogue.x, rogue.y - rogue.size * 1.5, rogue.x + rogue.size * 0.8, rogue.y - rogue.size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2d3748'; // Shadow for face
    ctx.beginPath();
    ctx.arc(rogue.x, rogue.y - rogue.size * 0.2, rogue.size * 0.7, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold 12px ${gameFont}`; ctx.textAlign = 'center';
    ctx.fillText(rogue.name, rogue.x, rogue.y + rogue.size + 10);
  }

  function drawChests() {
    chests.forEach(chest => {
      ctx.font = `30px ${gameFont}`;
      ctx.fillStyle = chest.open ? '#a0aec0' : '#713c1c'; // Brown for closed, gray for open
      ctx.fillRect(chest.x - 20, chest.y - 15, 40, 30); // Chest body
      ctx.fillStyle = '#5a2d0c'; // Darker brown for lid
      ctx.fillRect(chest.x - 22, chest.y - 20, 44, 10); // Lid
      if (chest.open && chest.collected) {
        ctx.fillStyle = '#f6ad55';
        ctx.fillText(chest.symbol, chest.x, chest.y + 10);
      } else if (chest.open && !chest.collected && targetArtifacts.includes(chest.id)) {
         ctx.fillStyle = '#f6ad55'; // Still show symbol if opened for target
         ctx.fillText(chest.symbol, chest.x, chest.y + 10);
      } else if (!chest.open) {
        ctx.font = `18px ${gameFont}`;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('?', chest.x, chest.y +5);
      }
      ctx.font = `12px ${gameFont}`; ctx.fillStyle = '#cbd5e0';
      ctx.fillText(chest.id.split(' ')[0], chest.x, chest.y + 30); // Display first word of ID
    });
  }
  
  function drawHeistBag() {
    ctx.font = `14px ${gameFont}`; ctx.fillStyle = '#cbd5e0'; ctx.textAlign = 'left';
    ctx.fillText("Heist Bag:", 20, canvas.height - 60);
    heistBag.forEach((item, index) => {
      ctx.fillText(`${index + 1}. ${item}`, 30, canvas.height - 45 + (index * 15));
    });
  }

  function animateRogueToChest(chestIndex: number, onComplete: () => void) {
    const targetChest = chests.find(c => c.id === targetArtifacts[chestIndex]);
    if (!targetChest) { onComplete(); return; }

    const startX = rogue.x;
    const startY = rogue.y;
    const endX = targetChest.x;
    const endY = targetChest.y + targetChest.symbol.length > 0 ? 30 : 20; // Move below the chest
    let animProgress = 0;
    const animDuration = 60; // frames

    function step() {
      animProgress++;
      const t = Math.min(animProgress / animDuration, 1);
      rogue.x = startX + (endX - startX) * t;
      rogue.y = startY + (endY - startY) * t;

      redrawSceneBase();
      if (t < 1) {
        setAnimFrameId(requestAnimationFrame(step));
      } else {
        targetChest.open = true;
        targetChest.collected = true; // Mark as collected for visual
        rogueMessage = `Rogue: Got the ${targetChest.id}!`;
        redrawSceneBase();
        setAnimFrameId(null);
        onComplete();
      }
    }
    setAnimFrameId(requestAnimationFrame(step));
  }
  
  function redrawSceneBase(messageOverride?: string, messageColorOverride?: string) {
      ctx.fillStyle = "#1a202c"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold 22px ${titleFont}`; ctx.fillStyle = "#f6ad55"; ctx.textAlign = "center";
      ctx.fillText("The Royal Heist", canvas.width / 2, 40);
      drawChests(); drawRogue(); drawHeistBag();
      ctx.font = `16px ${gameFont}`; ctx.fillStyle = messageColorOverride || rogueMessageColor; ctx.textAlign = "center";
      ctx.fillText(messageOverride || rogueMessage, canvas.width / 2, 70);
  }

  function processHeist() {
    if (currentTargetIndex < heistBag.length && currentTargetIndex < targetArtifacts.length) {
      const currentItemInBag = heistBag[currentTargetIndex];
      const expectedItem = targetArtifacts[currentTargetIndex];
      const chestForExpectedItem = chests.find(c => c.id === expectedItem);

      if (currentItemInBag === expectedItem) {
        if (chestForExpectedItem && !chestForExpectedItem.collected) {
           rogueMessage = `Rogue: Heading for the ${expectedItem}...`;
           animateRogueToChest(currentTargetIndex, () => {
             currentTargetIndex++;
             processHeist(); // Check next item
           });
           return; // Animation will handle next step
        } else if (chestForExpectedItem && chestForExpectedItem.collected) {
            // Already visualized as collected, move to next
            currentTargetIndex++;
            processHeist();
            return;
        }
      } else {
        // Wrong item or order
        rogueMessage = `Rogue: "Oops! That's not the ${expectedItem} I was looking for next!"`;
        rogueMessageColor = "#e53e3e";
        if (details.message) rogueMessage = `Oracle: ${details.message}`;
        finalizeVisuals();
        return;
      }
    }
    // All correctly collected items processed by animation, now check final state
    finalizeVisuals();
  }

  function finalizeVisuals() {
     if (details.passed) {
      rogueMessage = "Heist Successful! All artifacts secured!";
      rogueMessageColor = "#68d391";
      // Ensure all target chests are marked open and collected for final display
      targetArtifacts.forEach(id => {
          const chest = chests.find(c => c.id === id);
          if(chest) { chest.open = true; chest.collected = true;}
      });
    } else {
      if (!details.message?.includes("criteria pending")) { // Don't show generic error if it's just placeholder
        rogueMessage = details.message || "Rogue: Something's amiss with the plan...";
        rogueMessageColor = "#e53e3e";
      } else if (heistBag.length === 0) {
        rogueMessage = "Rogue: The bag is empty! What's the plan?";
        rogueMessageColor = "#a0aec0";
      }
    }
    redrawSceneBase(rogueMessage, rogueMessageColor);
    setAnimFrameId(null);
  }
  
  // Initial draw and logic start
  if (Array.isArray(details.evaluatedValue)) { // Only run animation sequence if code produced an array
      // Mark chests as collected based on the evaluated heistBag for initial state before animation
      heistBag.forEach(itemInBag => {
          const targetChest = chests.find(c => c.id === itemInBag && targetArtifacts.includes(itemInBag));
          if(targetChest) {
              targetChest.open = true; // Open if it's a target and in the bag
              targetChest.collected = true;
          }
      });
      processHeist();
  } else { // Code didn't produce an array or other issue
      finalizeVisuals();
  }
});


// --- New Curriculum Structure ---
// Define the static part of mainTopics first
const staticMainTopics: MainTopic[] = [
    {
      id: 'mt_intro_js',
      name: 'Introduction to JavaScript',
      description: "Begin your journey into the world of JavaScript, understanding its origins and how it breathes life into the web.",
      subTopics: [
        {
          id: 'st_intro_what_is_js',
          name: 'What is JavaScript?',
          concepts: [
            { id: 'c_what_is_js_overview', name: 'Overview of JavaScript', challenge: { 
                id: 'c_what_is_js_overview', 
                title: 'The Scribe\'s First Scroll: What is JavaScript?', 
                description: defaultDescription('JavaScript\'s role and purpose'), 
                difficulty: 1, 
                starterCode: `// JavaScript: The Lingua Franca of the Web\n\n// JavaScript (JS) is a versatile, high-level programming language.\n// Originally created to make web pages interactive, it now runs everywhere:\n// - In web browsers (Chrome, Firefox, Safari, Edge)\n// - On servers (Node.js)\n// - In mobile apps, desktop apps, and even games!\n\n// Key Characteristics:\n// 1. Client-Side Scripting: Primarily used to manipulate web page content\n//    dynamically in the user's browser.\n// 2. Multi-Paradigm: Supports event-driven, functional, and imperative\n//    (including object-oriented and prototype-based) programming styles.\n// 3. Interpreted/JIT Compiled: Code is often executed line by line, or\n//    compiled "just-in-time" for performance.\n// 4. Dynamically Typed: Variable types are checked during execution, not at compile time.\n\n// In \"Code & Conquest\", JavaScript is the magic you'll use to cast spells!\n// This scroll marks your first step. It is known.`, 
                solutionCriteria: () => ({ passed: true, message: "This foundational knowledge is acknowledged."}) // Auto-pass
              } 
            },
          ],
        },
        {
          id: 'st_intro_history', name: 'History of JavaScript',
          concepts: [ 
            { id: 'c_history_timeline', name: 'JavaScript Timeline', challenge: { 
                id: 'c_history_timeline', 
                title: 'Echoes of the Past: JavaScript\'s History', 
                description: defaultDescription('key milestones in JavaScript history'), 
                difficulty: 1, 
                starterCode: `// A Brief History of JavaScript (The Path of the Ancients):\n\n// 1995: Brendan Eich at Netscape creates "Mocha", soon renamed to "LiveScript",\n//       and then to "JavaScript" to capitalize on Java's popularity.\n//       (It's not related to Java other than by name and some syntax similarities!)\n\n// 1996: Microsoft releases JScript, a reverse-engineered version for Internet Explorer.\n\n// 1997: ECMAScript standard is born. ECMA International standardizes JavaScript\n//       to ensure interoperability between different browser implementations.\n//       JavaScript is now officially an implementation of the ECMAScript specification.\n\n// Key ECMAScript Versions (The Great Ages):\n// - ES1 (1997), ES2 (1998), ES3 (1999) - Early foundations.\n// - ES5 (2009) - A major update, adding 'strict mode', JSON support, etc.\n// - ES6 / ECMAScript 2015 (2015) - The most significant update: let/const,\n//   arrow functions, classes, Promises, modules, and much more.\n// - ECMAScript 2016+ : Annual releases bringing smaller, incremental improvements.\n\n// This knowledge is etched in the arcane texts.`, 
                 solutionCriteria: () => ({ passed: true, message: "This historical knowledge is acknowledged."}) // Auto-pass
              } 
            } 
          ],
        },
        {
          id: 'st_intro_versions', name: 'JavaScript Versions',
          concepts: [ 
            { id: 'c_versions_es6', name: 'Understanding ES6+', challenge: { 
                id: 'c_versions_es6', 
                title: 'The Modern Dialect: ES6 and Beyond', 
                description: defaultDescription('ECMAScript versions'), 
                difficulty: 1, 
                starterCode: `// JavaScript Versions: The Evolution of Spells\n\n// JavaScript is an evolving language, standardized by ECMA International\n// under the name ECMAScript.\n\n// "ES" followed by a number or year refers to a version of the ECMAScript standard.\n\n// - ES5 (ECMAScript 5, 2009): A major update that brought stability and new features\n//   like strict mode, JSON support, and Array extras (forEach, map, filter).\n//   Most "old" JavaScript code you see might be ES5.\n\n// - ES6 / ECMAScript 2015: A revolutionary update! This is considered \"Modern JavaScript\".\n//   Introduced fundamental changes and additions:\n//     * \`let\` and \`const\` for variable declarations\n//     * Arrow Functions ( => )\n//     * Classes (syntactic sugar over prototypes)\n//     * Promises (for asynchronous operations)\n//     * Template Literals (string interpolation with \`\${}\`)\n//     * Destructuring assignments\n//     * Modules (import/export)\n//     * ...and many more!\n\n// - ECMAScript 2016 onwards (ES2016, ES2017, etc.):\n//   New versions are released annually with smaller, incremental features.\n//   Browsers quickly adopt these new features.\n\n// "Code & Conquest" focuses on modern JavaScript (ES6+), the most potent form of spellcasting!`, 
                solutionCriteria: () => ({ passed: true, message: "This version knowledge is acknowledged."}) // Auto-pass
              } 
            } 
          ],
        },
        {
          id: 'st_intro_how_to_run', name: 'How to run JavaScript?',
          concepts: [ 
            { id: 'c_running_js_browser', name: 'In the Browser', challenge: { 
                id: 'c_running_js_browser', 
                title: 'Whispers in the Console: Running JS in Browsers', 
                description: defaultDescription('how JavaScript runs in web browsers'), 
                difficulty: 1, 
                starterCode: `// How JavaScript Spells are Cast (Executed):\n\n// 1. In Web Browsers (The Most Common Realm):\n//    - JavaScript code is embedded in HTML files using <script> tags.\n//      \`<script>alert('Hello, Sorcerer!');</script>\`\n//    - Or linked externally:\n//      \`<script src="my_spells.js"></script>\`\n//    - Browsers have built-in JavaScript engines (e.g., V8 in Chrome, SpiderMonkey in Firefox)\n//      that interpret and execute the code.\n//    - You can also type JavaScript directly into the browser's Developer Console.\n//      (Try pressing F12 or right-click -> Inspect -> Console)\n\n// 2. On Servers (e.g., Node.js - The Realm of Backend Magic):\n//    - Node.js allows you to run JavaScript outside of a browser.\n//    - Used for building web servers, command-line tools, and more.\n//    - Example (in a file named \`server_spell.js\` run with \`node server_spell.js\`):\n//      \`console.log('The server awakens!');\`\n\n// 3. Other Environments:\n//    - Mobile apps (React Native, NativeScript)\n//    - Desktop apps (Electron)\n//    - Game development (various engines)\n\n// In \"Code & Conquest\", your spells are primarily cast within a simulated browser environment.`, 
                solutionCriteria: () => ({ passed: true, message: "This execution knowledge is acknowledged."}) // Auto-pass
              } 
            } 
          ],
        },
      ],
    },
    {
      id: 'mt_all_about_variables',
      name: 'All About Variables',
      description: "Master the art of storing and managing information using variables, the fundamental building blocks of your spells.",
      subTopics: [
        {
          id: 'st_var_declarations',
          name: 'Variable Declarations',
          concepts: [
            { id: 'c_var_declare_basic', name: '`var`: Basic Declaration', challenge: { id: 'c_var_declare_basic', title: 'Ancient Runes: Basic `var`', description: 'Declare a variable named `ancientScroll` using `var` and assign it the value "Old Lore".', difficulty: 1, starterCode: defaultStarterCode('`var` basic declaration'), solutionCriteria: defaultSolutionCriteria('`var` basic declaration'), isPlaceholder: true } },
            { id: 'c_var_scope_function', name: '`var`: Function Scope', challenge: { id: 'c_var_scope_function', title: 'Ancient Runes: `var` & Function Scope', description: 'Demonstrate that `var` is function-scoped by declaring it inside a function and trying to access it outside.', difficulty: 1, starterCode: defaultStarterCode('`var` function scope'), solutionCriteria: defaultSolutionCriteria('`var` function scope'), isPlaceholder: true } },
            { id: 'c_var_redeclaration', name: '`var`: Re-declaration', challenge: { id: 'c_var_redeclaration', title: 'Ancient Runes: `var` Re-declaration', description: 'Show that `var` allows re-declaration of the same variable in the same scope without error.', difficulty: 1, starterCode: defaultStarterCode('`var` re-declaration'), solutionCriteria: defaultSolutionCriteria('`var` re-declaration'), isPlaceholder: true } },
            { id: 'c1_1_let_string', name: '`let`: Basic Use', challenge: {
                id: "c1_1_let_string",
                title: "The First Spell: Naming Your Quest (`let`)",
                description: "To begin your adventure, your hero needs a quest. Declare a variable named `questName` using `let` and assign it the string value 'The Lost Artifact'. This will send your hero to retrieve the Quest Scroll.",
                difficulty: 1,
                starterCode: "// Your spell (code) goes here to declare questName\nlet questName = '';",
                solutionCriteria: (code) => {
                  if (!code.includes('let questName')) return { passed: false, message: "Make sure you use 'let questName' to declare the variable."};
                  return evaluateCodeAndCheckVariable(code, 'questName', 'string', 'The Lost Artifact');
                },
                hint: "Remember to use the `let` keyword for variables that might change. String values must be enclosed in quotes (e.g., 'your string'). Your hero awaits the correct quest name!",
                solutionExplanation: "Use `let questName = 'The Lost Artifact';` to declare a variable `questName` and assign it the specified string, dispatching your hero.",
                visualFeedback: C1_1_VISUAL_FEEDBACK,
              }
            },
             { id: 'c_let_block_scope', name: '`let`: Block Scope', challenge: { id: 'c_let_block_scope', title: 'Modern Magic: `let` & Block Scope', description: 'Demonstrate that `let` is block-scoped using an `if` block or a simple `{}` block.', difficulty: 1, starterCode: defaultStarterCode('`let` block scope'), solutionCriteria: defaultSolutionCriteria('`let` block scope'), isPlaceholder: true } },
            { id: 'c_let_no_redeclaration', name: '`let`: No Re-declaration', challenge: { id: 'c_let_no_redeclaration', title: 'Modern Magic: `let` & No Re-declaration', description: 'Show that `let` does not allow re-declaration in the same scope and results in an error.', difficulty: 1, starterCode: defaultStarterCode('`let` no re-declaration'), solutionCriteria: defaultSolutionCriteria('`let` no re-declaration'), isPlaceholder: true } },
            { id: 'c1_2_const_number', name: '`const`: Basic Use', challenge: {
                id: "c1_2_const_number",
                title: "The Unchanging Mana Crystal (`const`)",
                description: "Your Mage has found a Mana Crystal! Its power is fixed. Declare a constant named `maxMana` and assign it the numerical value `100`. This will fully charge the Mage's power.",
                difficulty: 1,
                starterCode: "// Declare your constant maxMana here\n",
                solutionCriteria: (code) => {
                  if (!code.includes('const maxMana')) return { passed: false, message: "Make sure you use 'const maxMana' to declare the constant."};
                  return evaluateCodeAndCheckVariable(code, 'maxMana', 'number', 100);
                },
                hint: "For values that should never change, use the `const` keyword. Numbers are written without quotes. The Mage needs exactly 100 mana units.",
                solutionExplanation: "Use `const maxMana = 100;` to declare a constant `maxMana` and assign it the number 100, empowering your Mage.",
                visualFeedback: C1_2_VISUAL_FEEDBACK,
              }
            },
            { id: 'c_const_block_scope', name: '`const`: Block Scope & Initialization', challenge: { id: 'c_const_block_scope', title: 'Immutable Power: `const` Scope & Init', description: 'Demonstrate `const` is block-scoped and must be initialized upon declaration.', difficulty: 1, starterCode: defaultStarterCode('`const` block scope & init'), solutionCriteria: defaultSolutionCriteria('`const` block scope & init'), isPlaceholder: true } },
            { id: 'c_const_object_mutation', name: '`const`: Object/Array Nuance', challenge: { id: 'c_const_object_mutation', title: 'Immutable Power: `const` Object/Array Nuance', description: 'Show that while a `const` variable cannot be reassigned, the properties of an object or elements of an array it holds can be mutated.', difficulty: 1, starterCode: defaultStarterCode('`const` object/array mutation'), solutionCriteria: defaultSolutionCriteria('`const` object/array mutation'), isPlaceholder: true } },
          ],
        },
        {
          id: 'st_var_hoisting', name: 'Hoisting',
          concepts: [ 
            { id: 'c_hoisting_var_basic', name: '`var` Hoisting: Declaration', challenge: { id: 'c_hoisting_var_basic', title: 'Spectral Variables: `var` Declaration Hoisting', description: 'Demonstrate how `var` declarations are hoisted (without their assignments).', difficulty: 1, starterCode: defaultStarterCode('`var` hoisting (declaration)'), solutionCriteria: defaultSolutionCriteria('`var` hoisting (declaration)'), isPlaceholder: true } },
            { id: 'c_hoisting_var_assignment', name: '`var` Hoisting: Assignment Not Hoisted', challenge: { id: 'c_hoisting_var_assignment', title: 'Spectral Variables: `var` Assignment Not Hoisted', description: 'Show that only the declaration of `var` is hoisted, not the assignment, leading to `undefined` if accessed before assignment.', difficulty: 1, starterCode: defaultStarterCode('`var` hoisting (assignment)'), solutionCriteria: defaultSolutionCriteria('`var` hoisting (assignment)'), isPlaceholder: true } },
            { id: 'c_hoisting_let_const_tdz', name: '`let`/`const` Hoisting (TDZ)', challenge: { id: 'c_hoisting_let_const_tdz', title: 'Spectral Variables: `let`/`const` & TDZ', description: 'Explain and show the Temporal Dead Zone (TDZ) for `let` and `const` variables.', difficulty: 1, starterCode: defaultStarterCode('`let`/`const` TDZ'), solutionCriteria: defaultSolutionCriteria('`let`/`const` TDZ'), isPlaceholder: true } },
          ],
        },
        {
          id: 'st_var_naming_rules', name: 'Variable Naming Rules',
          concepts: [ 
            { id: 'c_naming_valid', name: 'Valid Names', challenge: { id: 'c_naming_valid', title: 'The Scribe\'s Code: Valid Names', description: 'Create variables with various valid naming conventions (letters, numbers, _, $).', difficulty: 1, starterCode: defaultStarterCode('Valid Variable Names'), solutionCriteria: defaultSolutionCriteria('Valid Variable Names'), isPlaceholder: true } },
            { id: 'c_naming_invalid', name: 'Invalid Names', challenge: { id: 'c_naming_invalid', title: 'The Scribe\'s Code: Forbidden Names', description: 'Attempt to create variables with invalid names (starting with number, keywords) and observe errors.', difficulty: 1, starterCode: defaultStarterCode('Invalid Variable Names'), solutionCriteria: defaultSolutionCriteria('Invalid Variable Names'), isPlaceholder: true } },
            { id: 'c_naming_case_sensitive', name: 'Case Sensitivity', challenge: { id: 'c_naming_case_sensitive', title: 'The Scribe\'s Code: Case Sensitivity', description: 'Demonstrate that JavaScript variable names are case-sensitive.', difficulty: 1, starterCode: defaultStarterCode('Case Sensitive Names'), solutionCriteria: defaultSolutionCriteria('Case Sensitive Names'), isPlaceholder: true } },
          ],
        },
        {
          id: 'st_var_scopes', name: 'Variable Scopes',
          concepts: [
            { id: 'c_scope_global_access', name: 'Global Scope: Access', challenge: { id: 'c_scope_global_access', title: 'The Worldly Realm: Global Scope Access', description: 'Declare a global variable and access it inside a function.', difficulty: 1, starterCode: defaultStarterCode('Global Scope Access'), solutionCriteria: defaultSolutionCriteria('Global Scope Access'), isPlaceholder: true } },
            { id: 'c_scope_global_shadowing', name: 'Global Scope: Shadowing', challenge: { id: 'c_scope_global_shadowing', title: 'The Worldly Realm: Global Variable Shadowing', description: 'Show how a local variable can "shadow" a global variable with the same name within a function.', difficulty: 1, starterCode: defaultStarterCode('Global Scope Shadowing'), solutionCriteria: defaultSolutionCriteria('Global Scope Shadowing'), isPlaceholder: true } },
            { id: 'c_scope_function_var', name: 'Function Scope: `var` Confinement', challenge: { id: 'c_scope_function_var', title: 'Inner Sanctums: `var` Confinement', description: 'Reiterate that `var` declared inside a function is not accessible outside.', difficulty: 1, starterCode: defaultStarterCode('Function Scope `var` Confinement'), solutionCriteria: defaultSolutionCriteria('Function Scope `var` Confinement'), isPlaceholder: true } },
            { id: 'c_scope_block_let_const', name: 'Block Scope: `let`/`const` Confinement', challenge: { id: 'c_scope_block_let_const', title: 'Sacred Boundaries: `let`/`const` Confinement', description: 'Show that `let` and `const` declared inside a block (e.g., `if`, `for`, or `{}`) are not accessible outside.', difficulty: 1, starterCode: defaultStarterCode('Block Scope `let`/`const` Confinement'), solutionCriteria: defaultSolutionCriteria('Block Scope `let`/`const` Confinement'), isPlaceholder: true } },
            { id: 'c_scope_nested', name: 'Nested Scopes', challenge: { id: 'c_scope_nested', title: 'Scopes within Scopes', description: 'Demonstrate variable access rules across nested functions or blocks (lexical scoping).', difficulty: 1, starterCode: defaultStarterCode('Nested Scopes'), solutionCriteria: defaultSolutionCriteria('Nested Scopes'), isPlaceholder: true } },
          ],
        },
      ],
    },
    {
        id: 'mt_data_types',
        name: 'Data Types',
        description: "Explore the various forms of data that JavaScript can manipulate, from simple primitive values to complex objects.",
        subTopics: [
            {
                id: 'st_dt_primitive', name: 'Primitive Types',
                concepts: [
                    { id: 'c_dt_string_basic', name: 'string: Declaration & Concatenation', challenge: { id: 'c_dt_string_basic', title: 'Whispers on the Wind: String Basics', difficulty: 1, description: 'Declare string variables and concatenate them.', starterCode: defaultStarterCode('string basics'), solutionCriteria: defaultSolutionCriteria('string basics'), isPlaceholder: true } },
                    { id: 'c_dt_string_props_methods', name: 'string: Properties & Methods', challenge: { id: 'c_dt_string_props_methods', title: 'Whispers on the Wind: String Powers', difficulty: 1, description: 'Explore common string properties (e.g., `length`) and methods (e.g., `toUpperCase()`, `slice()`).', starterCode: defaultStarterCode('string properties/methods'), solutionCriteria: defaultSolutionCriteria('string properties/methods'), isPlaceholder: true } },
                    { id: 'c_dt_number_basic', name: 'number: Integers & Floats', challenge: { id: 'c_dt_number_basic', title: 'Counting Stars: Number Basics', difficulty: 1, description: 'Declare integer and floating-point number variables. Perform basic arithmetic.', starterCode: defaultStarterCode('number basics'), solutionCriteria: defaultSolutionCriteria('number basics'), isPlaceholder: true } },
                    { id: 'c_dt_number_special', name: 'number: NaN & Infinity', challenge: { id: 'c_dt_number_special', title: 'Counting Stars: Special Numbers', difficulty: 1, description: 'Understand `NaN` and `Infinity` and how they arise.', starterCode: defaultStarterCode('NaN & Infinity'), solutionCriteria: defaultSolutionCriteria('NaN & Infinity'), isPlaceholder: true } },
                    { id: 'c_dt_boolean_basic', name: 'boolean: True & False', challenge: { id: 'c_dt_boolean_basic', title: 'Truth and Falsehood: Boolean Basics', difficulty: 1, description: 'Declare boolean variables and use them in simple comparisons.', starterCode: defaultStarterCode('boolean basics'), solutionCriteria: defaultSolutionCriteria('boolean basics'), isPlaceholder: true } },
                    { id: 'c_dt_boolean_logical_ops', name: 'boolean: Logical Operations', challenge: { id: 'c_dt_boolean_logical_ops', title: 'Truth and Falsehood: Boolean Logic', difficulty: 1, description: 'Use logical operators (`&&`, `||`, `!`) with boolean values.', starterCode: defaultStarterCode('boolean logical ops'), solutionCriteria: defaultSolutionCriteria('boolean logical ops'), isPlaceholder: true } },
                    { id: 'c_dt_undefined_implicit', name: 'undefined: Implicitly', challenge: { id: 'c_dt_undefined_implicit', title: 'The Void: Implicit Undefined', difficulty: 1, description: 'Show how a variable declared but not assigned is `undefined`.', starterCode: defaultStarterCode('implicit undefined'), solutionCriteria: defaultSolutionCriteria('implicit undefined'), isPlaceholder: true } },
                    { id: 'c_dt_undefined_explicit', name: 'undefined: Explicitly (Rare)', challenge: { id: 'c_dt_undefined_explicit', title: 'The Void: Explicit Undefined (Context)', difficulty: 1, description: 'Explain that `undefined` is also a primitive type and can be (though rarely) explicitly assigned.', starterCode: defaultStarterCode('explicit undefined'), solutionCriteria: defaultSolutionCriteria('explicit undefined'), isPlaceholder: true } },
                    { id: 'c_dt_null_concept', name: 'null: Intentional Absence', challenge: { id: 'c_dt_null_concept', title: 'Intentional Emptiness: Null Concept', difficulty: 1, description: 'Understand `null` as representing the intentional absence of any object value.', starterCode: defaultStarterCode('null concept'), solutionCriteria: defaultSolutionCriteria('null concept'), isPlaceholder: true } },
                    { id: 'c_dt_bigint_need', name: 'BigInt: The Need for Larger Integers', challenge: { id: 'c_dt_bigint_need', title: 'Titanic Integers: Need for BigInt', difficulty: 1, description: 'Explain scenarios where `number` type is insufficient for very large integers and `BigInt` is needed.', starterCode: defaultStarterCode('BigInt need'), solutionCriteria: defaultSolutionCriteria('BigInt need'), isPlaceholder: true } },
                    { id: 'c_dt_bigint_syntax', name: 'BigInt: Syntax', challenge: { id: 'c_dt_bigint_syntax', title: 'Titanic Integers: BigInt Syntax', difficulty: 1, description: 'Demonstrate how to create `BigInt` literals (e.g., `100n`) and using the `BigInt()` constructor.', starterCode: defaultStarterCode('BigInt syntax'), solutionCriteria: defaultSolutionCriteria('BigInt syntax'), isPlaceholder: true } },
                    { id: 'c_dt_symbol_concept', name: 'Symbol: Unique Identifiers', challenge: { id: 'c_dt_symbol_concept', title: 'Unique Sigils: Symbol Concept', difficulty: 1, description: 'Understand `Symbol` for creating unique identifiers, often used as object property keys.', starterCode: defaultStarterCode('Symbol concept'), solutionCriteria: defaultSolutionCriteria('Symbol concept'), isPlaceholder: true } },
                    { id: 'c_dt_symbol_creation', name: 'Symbol: Creation & Uniqueness', challenge: { id: 'c_dt_symbol_creation', title: 'Unique Sigils: Symbol Creation', difficulty: 1, description: 'Create Symbols and demonstrate their uniqueness even with the same description.', starterCode: defaultStarterCode('Symbol creation'), solutionCriteria: defaultSolutionCriteria('Symbol creation'), isPlaceholder: true } },
                ]
            },
            {
                id: 'st_dt_object_type', name: 'Object Type',
                concepts: [
                     { id: 'c_dt_object_creation_literal', name: 'Object: Creation (Literal)', challenge: { id: 'c_dt_object_creation_literal', title: 'Chests of Holding: Object Literals', difficulty: 1, description: 'Create a simple object using object literal syntax `{}` with key-value pairs.', starterCode: defaultStarterCode('Object literal'), solutionCriteria: defaultSolutionCriteria('Object literal'), isPlaceholder: true } },
                     { id: 'c_dt_object_access_dot', name: 'Object: Property Access (Dot Notation)', challenge: { id: 'c_dt_object_access_dot', title: 'Chests of Holding: Dot Notation Access', difficulty: 1, description: 'Access object properties using dot notation (`object.property`).', starterCode: defaultStarterCode('Object dot access'), solutionCriteria: defaultSolutionCriteria('Object dot access'), isPlaceholder: true } },
                     { id: 'c_dt_object_access_bracket', name: 'Object: Property Access (Bracket Notation)', challenge: { id: 'c_dt_object_access_bracket', title: 'Chests of Holding: Bracket Notation Access', difficulty: 1, description: 'Access object properties using bracket notation (`object["property"]`), especially with dynamic keys.', starterCode: defaultStarterCode('Object bracket access'), solutionCriteria: defaultSolutionCriteria('Object bracket access'), isPlaceholder: true } },
                     { id: 'c_dt_object_modification', name: 'Object: Property Modification', challenge: { id: 'c_dt_object_modification', title: 'Chests of Holding: Modifying Contents', difficulty: 1, description: 'Modify existing property values and add new properties to an object.', starterCode: defaultStarterCode('Object modification'), solutionCriteria: defaultSolutionCriteria('Object modification'), isPlaceholder: true } },
                     { id: 'c_dt_object_nested', name: 'Object: Nested Objects', challenge: { id: 'c_dt_object_nested', title: 'Chests of Holding: Inner Compartments (Nested Objects)', difficulty: 1, description: 'Create and access properties in nested objects.', starterCode: defaultStarterCode('Nested Objects'), solutionCriteria: defaultSolutionCriteria('Nested Objects'), isPlaceholder: true } },
                ]
            },
            {
                id: 'st_dt_typeof', name: 'typeof Operator',
                concepts: [
                     { id: 'c_dt_typeof_primitives', name: '`typeof`: Primitives', challenge: { id: 'c_dt_typeof_primitives', title: 'Scrying Glass: `typeof` with Primitives', difficulty: 1, description: 'Use `typeof` on all primitive data types and observe the results.', starterCode: defaultStarterCode('`typeof` primitives'), solutionCriteria: defaultSolutionCriteria('`typeof` primitives'), isPlaceholder: true } },
                     { id: 'c_dt_typeof_object_null_array', name: '`typeof`: Object, Null, Array Quirks', challenge: { id: 'c_dt_typeof_object_null_array', title: 'Scrying Glass: `typeof` Quirks (Object, Null, Array)', difficulty: 1, description: 'Understand `typeof null` returns "object", and `typeof` an array also returns "object".', starterCode: defaultStarterCode('`typeof` quirks'), solutionCriteria: defaultSolutionCriteria('`typeof` quirks'), isPlaceholder: true } },
                     { id: 'c_dt_typeof_function', name: '`typeof`: Functions', challenge: { id: 'c_dt_typeof_function', title: 'Scrying Glass: `typeof` with Functions', difficulty: 1, description: 'Show that `typeof` a function returns "function".', starterCode: defaultStarterCode('`typeof` function'), solutionCriteria: defaultSolutionCriteria('`typeof` function'), isPlaceholder: true } },
                ]
            }
        ]
    },
    {
        id: 'mt_type_casting',
        name: 'Type Casting',
        description: "Learn how JavaScript converts values from one type to another, both explicitly and implicitly.",
        subTopics: [
            {
                id: 'st_tc_conversion_coercion_intro', name: 'Type Conversion vs Coercion', // Merged for better flow
                concepts: [
                    { id: 'c_tc_conversion_vs_coercion_def', name: 'Definitions', challenge: { id: 'c_tc_conversion_vs_coercion_def', title: 'The Alchemist\'s Art: Definitions', difficulty: 1, description: 'Define Type Conversion (explicit) and Type Coercion (implicit).', starterCode: defaultStarterCode('Conversion vs Coercion Definitions'), solutionCriteria: defaultSolutionCriteria('Conversion vs Coercion Definitions'), isPlaceholder: true } },
                ]
            },
            {
                id: 'st_tc_explicit', name: 'Explicit Type Casting',
                concepts: [
                    { id: 'c_tc_explicit_string', name: 'To String', challenge: { id: 'c_tc_explicit_string', title: 'Willful Transformation: To String', difficulty: 1, description: 'Explicitly convert numbers and booleans to strings using `String()` and `.toString()`.', starterCode: defaultStarterCode('Explicit to String'), solutionCriteria: defaultSolutionCriteria('Explicit to String'), isPlaceholder: true } },
                    { id: 'c_tc_explicit_number', name: 'To Number', challenge: { id: 'c_tc_explicit_number', title: 'Willful Transformation: To Number', difficulty: 1, description: 'Explicitly convert strings and booleans to numbers using `Number()`, `parseInt()`, `parseFloat()`.', starterCode: defaultStarterCode('Explicit to Number'), solutionCriteria: defaultSolutionCriteria('Explicit to Number'), isPlaceholder: true } },
                    { id: 'c_tc_explicit_boolean', name: 'To Boolean', challenge: { id: 'c_tc_explicit_boolean', title: 'Willful Transformation: To Boolean', difficulty: 1, description: 'Explicitly convert various values (strings, numbers, null, undefined) to booleans using `Boolean()`. Understand truthy/falsy.', starterCode: defaultStarterCode('Explicit to Boolean'), solutionCriteria: defaultSolutionCriteria('Explicit to Boolean'), isPlaceholder: true } },
                ]
            },
            {
                id: 'st_tc_implicit', name: 'Implicit Type Casting (Coercion)',
                concepts: [
                    { id: 'c_tc_implicit_addition', name: 'Coercion: String Concatenation (+)', challenge: { id: 'c_tc_implicit_addition', title: 'Subtle Shifts: Coercion with + (String Concatenation)', difficulty: 1, description: 'Show how the `+` operator coerces numbers to strings when one operand is a string.', starterCode: defaultStarterCode('Coercion with + string'), solutionCriteria: defaultSolutionCriteria('Coercion with + string'), isPlaceholder: true } },
                    { id: 'c_tc_implicit_numeric_ops', name: 'Coercion: Numeric Operations (-, *, /, %)', challenge: { id: 'c_tc_implicit_numeric_ops', title: 'Subtle Shifts: Coercion with Numeric Ops (-, *, /, %)', difficulty: 1, description: 'Demonstrate how other arithmetic operators (-, *, /, %) try to coerce operands to numbers.', starterCode: defaultStarterCode('Coercion with numeric ops'), solutionCriteria: defaultSolutionCriteria('Coercion with numeric ops'), isPlaceholder: true } },
                    { id: 'c_tc_implicit_boolean_context', name: 'Coercion: Boolean Context (if, ||, &&)', challenge: { id: 'c_tc_implicit_boolean_context', title: 'Subtle Shifts: Coercion in Boolean Contexts', difficulty: 1, description: 'Show how values are coerced to booleans in contexts like `if` statements or logical operators.', starterCode: defaultStarterCode('Coercion in boolean context'), solutionCriteria: defaultSolutionCriteria('Coercion in boolean context'), isPlaceholder: true } },
                    { id: 'c_tc_implicit_equality', name: 'Coercion: Loose Equality (==)', challenge: { id: 'c_tc_implicit_equality', title: 'Subtle Shifts: Coercion with Loose Equality (==)', difficulty: 1, description: 'Illustrate type coercion with the `==` operator and its potential pitfalls.', starterCode: defaultStarterCode('Coercion with =='), solutionCriteria: defaultSolutionCriteria('Coercion with =='), isPlaceholder: true } },
                ]
            }
        ]
    },
    {
        id: 'mt_equality_comparisons',
        name: 'Equality Comparisons',
        description: "Understand the nuances of comparing values in JavaScript, including strict and loose equality.",
        subTopics: [
            {
                id: 'st_eq_algorithms', name: 'Equality Algorithms',
                concepts: [
                    { id: 'c_eq_loose_equality', name: 'isLooselyEqual (==)', challenge: { id: 'c_eq_loose_equality', title: 'The Shapeshifter\'s Test: Loose Equality (==)', difficulty: 1, description: defaultDescription('isLooselyEqual (`==`)'), starterCode: defaultStarterCode('Loose Equality'), solutionCriteria: defaultSolutionCriteria('Loose Equality'), isPlaceholder: true } },
                    { id: 'c_eq_strict_equality', name: 'isStrictlyEqual (===)', challenge: { id: 'c_eq_strict_equality', title: 'The Unwavering Truth: Strict Equality (===)', difficulty: 1, description: defaultDescription('isStrictlyEqual (`===`)'), starterCode: defaultStarterCode('Strict Equality'), solutionCriteria: defaultSolutionCriteria('Strict Equality'), isPlaceholder: true } },
                    { id: 'c_eq_samevaluezero', name: 'SameValueZero', challenge: { id: 'c_eq_samevaluezero', title: 'The Mirror of Zero: SameValueZero', difficulty: 1, description: defaultDescription('SameValueZero algorithm (underpins Object.is and others)'), starterCode: defaultStarterCode('SameValueZero'), solutionCriteria: defaultSolutionCriteria('SameValueZero'), isPlaceholder: true } },
                    { id: 'c_eq_samevalue', name: 'SameValue', challenge: { id: 'c_eq_samevalue', title: 'Identical Twins: SameValue Algorithm', difficulty: 1, description: defaultDescription('SameValue algorithm (treats NaNs as same)'), starterCode: defaultStarterCode('SameValue'), solutionCriteria: defaultSolutionCriteria('SameValue'), isPlaceholder: true } },
                ]
            },
            {
                id: 'st_eq_operators', name: 'Value Comparison Operators',
                concepts: [
                    { id: 'c_eq_object_is', name: 'Object.is', challenge: { id: 'c_eq_object_is', title: 'The Oracle\'s Decree: Object.is', difficulty: 1, description: defaultDescription('Object.is comparison'), starterCode: defaultStarterCode('Object.is'), solutionCriteria: defaultSolutionCriteria('Object.is'), isPlaceholder: true } },
                ]
            }
        ]
    },
    {
        id: 'mt_control_flow',
        name: 'Control Flow',
        description: "Direct the flow of your spells with loops, conditionals, and error handling.",
        subTopics: [
            {
                id: 'st_cf_loops', name: 'Loops and Iterations',
                concepts: [
                    { id: 'c_cf_for_loop', name: 'for statement', challenge: { id: 'c_cf_for_loop', title: 'The Rhythmic Chant: `for` loop', difficulty: 1, description: defaultDescription('`for` statement'), starterCode: defaultStarterCode('for loop'), solutionCriteria: defaultSolutionCriteria('for loop'), isPlaceholder: true } },
                    { id: 'c_cf_dowhile_loop', name: 'do...while statement', challenge: { id: 'c_cf_dowhile_loop', title: 'The Persistent Invocation: `do...while`', difficulty: 1, description: defaultDescription('`do...while` statement'), starterCode: defaultStarterCode('do...while loop'), solutionCriteria: defaultSolutionCriteria('do...while loop'), isPlaceholder: true } },
                    { id: 'c_cf_while_loop', name: 'while statement', challenge: { id: 'c_cf_while_loop', title: 'The Vigilant Watch: `while` loop', difficulty: 1, description: defaultDescription('`while` statement'), starterCode: defaultStarterCode('while loop'), solutionCriteria: defaultSolutionCriteria('while loop'), isPlaceholder: true } },
                    { id: 'c_cf_forin_loop', name: 'for...in statement', challenge: { id: 'c_cf_forin_loop', title: 'Enumerating Treasures: `for...in`', difficulty: 1, description: defaultDescription('`for...in` statement for object properties'), starterCode: defaultStarterCode('for...in loop'), solutionCriteria: defaultSolutionCriteria('for...in loop'), isPlaceholder: true } },
                    { id: 'c_cf_forof_loop', name: 'for...of statement', challenge: { id: 'c_cf_forof_loop', title: 'Walking the Path: `for...of`', difficulty: 1, description: defaultDescription('`for...of` statement for iterables'), starterCode: defaultStarterCode('for...of loop'), solutionCriteria: defaultSolutionCriteria('for...of loop'), isPlaceholder: true } },
                    { id: 'c_cf_break_continue', name: 'break / continue', challenge: { id: 'c_cf_break_continue', title: 'Altering Fate: `break` and `continue`', difficulty: 1, description: defaultDescription('`break` and `continue` statements in loops'), starterCode: defaultStarterCode('break/continue'), solutionCriteria: defaultSolutionCriteria('break/continue'), isPlaceholder: true } },
                ]
            },
            {
                id: 'st_cf_conditionals', name: 'Conditional Statements',
                concepts: [
                    { id: 'c_cf_if_else', name: 'if...else', challenge: { id: 'c_cf_if_else', title: 'Forking Paths: `if...else`', difficulty: 1, description: defaultDescription('`if...else` statements'), starterCode: defaultStarterCode('if...else'), solutionCriteria: defaultSolutionCriteria('if...else'), isPlaceholder: true } },
                    { id: 'c_cf_switch', name: 'switch', challenge: { id: 'c_cf_switch', title: 'Choosing Destinies: `switch` statement', difficulty: 1, description: defaultDescription('`switch` statement'), starterCode: defaultStarterCode('switch'), solutionCriteria: defaultSolutionCriteria('switch'), isPlaceholder: true } },
                ]
            },
            {
                id: 'st_cf_exception_handling', name: 'Exception Handling',
                concepts: [
                    { id: 'c_cf_eh_basics', name: 'Exception Handling: Fundamentals', challenge: { id: 'c_cf_eh_basics', title: 'Warding Basics: Exception Fundamentals', difficulty: 1, description: 'Understand what exceptions are and why handling is important.', starterCode: defaultStarterCode('Exception Handling Fundamentals'), solutionCriteria: defaultSolutionCriteria('Exception Handling Fundamentals'), isPlaceholder: true } },
                    { id: 'c_cf_try_catch_finally', name: 'try/catch/finally', challenge: { id: 'c_cf_try_catch_finally', title: 'Warding Off Calamity: `try/catch/finally`', difficulty: 1, description: defaultDescription('`try/catch/finally` blocks'), starterCode: defaultStarterCode('try/catch/finally'), solutionCriteria: defaultSolutionCriteria('try/catch/finally'), isPlaceholder: true } },
                    { id: 'c_cf_throw', name: 'throw statement', challenge: { id: 'c_cf_throw', title: 'Unleashing Exceptions: `throw`', difficulty: 1, description: defaultDescription('`throw` statement'), starterCode: defaultStarterCode('throw'), solutionCriteria: defaultSolutionCriteria('throw'), isPlaceholder: true } },
                    { id: 'c_cf_error_objects', name: 'Utilizing Error Objects', challenge: { id: 'c_cf_error_objects', title: 'Understanding Omens: Error Objects', difficulty: 1, description: defaultDescription('Utilizing Error Objects'), starterCode: defaultStarterCode('Error Objects'), solutionCriteria: defaultSolutionCriteria('Error Objects'), isPlaceholder: true } },
                    { id: 'c_cf_labeled_statements', name: 'Labeled Statements', challenge: { id: 'c_cf_labeled_statements', title: 'Marked Passages: Labeled Statements', difficulty: 2, description: defaultDescription('Labeled Statements with break/continue'), starterCode: defaultStarterCode('Labeled Statements'), solutionCriteria: defaultSolutionCriteria('Labeled Statements'), isPlaceholder: true } },
                    { id: 'c_cf_eh_advanced', name: 'Advanced Exception Handling', challenge: { id: 'c_cf_eh_advanced', title: 'Master Warding: Advanced Techniques', difficulty: 2, description: 'Custom error types and advanced patterns.', starterCode: defaultStarterCode('Advanced Exception Handling'), solutionCriteria: defaultSolutionCriteria('Advanced Exception Handling'), isPlaceholder: true } },
                ]
            }
        ]
    },
    {
        id: 'mt_expressions_operators',
        name: 'Expressions and Operators',
        description: "Understand the fundamental building blocks of JavaScript statements: expressions and the operators that act upon them.",
        subTopics: [
            {
                id: 'st_eo_operator_types', name: 'Common Operator Types',
                concepts: [
                    { id: 'c_eo_assignment', name: 'Assignment Operators', challenge: { id: 'c_eo_assignment', title: 'Binding Essences: Assignment Operators', difficulty: 1, description: defaultDescription('Assignment Operators (=, +=, -=, etc.)'), starterCode: defaultStarterCode('Assignment Operators'), solutionCriteria: defaultSolutionCriteria('Assignment Operators'), isPlaceholder: true } },
                    { id: 'c_eo_comparison', name: 'Comparison Operators', challenge: { id: 'c_eo_comparison', title: 'Weighing Truths: Comparison Operators', difficulty: 1, description: defaultDescription('Comparison Operators (==, ===, !=, !==, >, <, etc.)'), starterCode: defaultStarterCode('Comparison Operators'), solutionCriteria: defaultSolutionCriteria('Comparison Operators'), isPlaceholder: true } },
                    { id: 'c_eo_arithmetic', name: 'Arithmetic Operators', challenge: { id: 'c_eo_arithmetic', title: 'Numerical Alchemy: Arithmetic Operators', difficulty: 1, description: defaultDescription('Arithmetic Operators (+, -, *, /, %, ++, --)'), starterCode: defaultStarterCode('Arithmetic Operators'), solutionCriteria: defaultSolutionCriteria('Arithmetic Operators'), isPlaceholder: true } },
                    { id: 'c_eo_logical', name: 'Logical Operators', challenge: { id: 'c_eo_logical', title: 'Threads of Logic: Logical Operators', difficulty: 1, description: defaultDescription('Logical Operators (&&, ||, !)'), starterCode: defaultStarterCode('Logical Operators'), solutionCriteria: defaultSolutionCriteria('Logical Operators'), isPlaceholder: true } },
                    { id: 'c_eo_string_ops', name: 'String Operators', challenge: { id: 'c_eo_string_ops', title: 'Word Weaving: String Operators', difficulty: 1, description: defaultDescription('String concatenation (+) and other string operations'), starterCode: defaultStarterCode('String Operators'), solutionCriteria: defaultSolutionCriteria('String Operators'), isPlaceholder: true } },
                    { id: 'c_eo_conditional_ternary', name: 'Conditional (Ternary) Operator', challenge: { id: 'c_eo_conditional_ternary', title: 'A Quick Choice: Conditional Operator', difficulty: 1, description: defaultDescription('Conditional (ternary) operator (condition ? exprIfTrue : exprIfFalse)'), starterCode: defaultStarterCode('Conditional Operator'), solutionCriteria: defaultSolutionCriteria('Conditional Operator'), isPlaceholder: true } },
                    { id: 'c_eo_unary', name: 'Unary Operators', challenge: { id: 'c_eo_unary', title: 'Single Focus: Unary Operators', difficulty: 1, description: defaultDescription('Unary Operators (delete, typeof, void, +, -, ++, --, !, ~)'), starterCode: defaultStarterCode('Unary Operators'), solutionCriteria: defaultSolutionCriteria('Unary Operators'), isPlaceholder: true } },
                    { id: 'c_eo_bitwise', name: 'Bitwise Operators', challenge: { id: 'c_eo_bitwise', title: 'Manipulating the Weave: Bitwise Operators', difficulty: 2, description: defaultDescription('Bitwise Operators (&, |, ^, ~, <<, >>, >>>)'), starterCode: defaultStarterCode('Bitwise Operators'), solutionCriteria: defaultSolutionCriteria('Bitwise Operators'), isPlaceholder: true } }, // Text: Beginner
                    { id: 'c_eo_bigint_ops', name: 'BigInt Operators', challenge: { id: 'c_eo_bigint_ops', title: 'Colossal Calculations: BigInt Operators', difficulty: 2, description: defaultDescription('Operators for BigInt numbers'), starterCode: defaultStarterCode('BigInt Operators'), solutionCriteria: defaultSolutionCriteria('BigInt Operators'), isPlaceholder: true } }, // Text: Beginner
                    { id: 'c_eo_comma', name: 'Comma Operator', challenge: { id: 'c_eo_comma', title: 'Sequential Spells: Comma Operator', difficulty: 2, description: defaultDescription('Comma operator'), starterCode: defaultStarterCode('Comma Operator'), solutionCriteria: defaultSolutionCriteria('Comma Operator'), isPlaceholder: true } },
                    { id: 'c_eo_relational', name: 'Relational Operators', challenge: { id: 'c_eo_relational', title: 'In Relation: Relational Operators', difficulty: 2, description: defaultDescription('Relational Operators (in, instanceof)'), starterCode: defaultStarterCode('Relational Operators'), solutionCriteria: defaultSolutionCriteria('Relational Operators'), isPlaceholder: true } },
                ]
            }
        ]
    },
    {
        id: 'mt_functions_foundations', // Renamed slightly to differentiate from mt_functions_advanced
        name: 'Functions - Foundations',
        description: "Learn to craft reusable blocks of code with functions, the core of modular spellcasting.",
        subTopics: [
            {
                id: 'st_ff_defining_calling', name: 'Defining and Calling',
                concepts: [
                    { id: 'c_ff_func_declarations', name: 'Function Declarations', challenge: { id: 'c_ff_func_declarations', title: 'The First Incantation: Function Declarations', difficulty: 1, description: 'Learn the basic syntax for declaring a named function.', starterCode: defaultStarterCode('Function Declarations'), solutionCriteria: defaultSolutionCriteria('Function Declarations'), isPlaceholder: true } },
                    { id: 'c_ff_func_expressions', name: 'Function Expressions', challenge: { id: 'c_ff_func_expressions', title: 'Binding Magic: Function Expressions', difficulty: 1, description: 'Understand how to assign a function to a variable.', starterCode: defaultStarterCode('Function Expressions'), solutionCriteria: defaultSolutionCriteria('Function Expressions'), isPlaceholder: true } },
                    { id: 'c_ff_calling_functions', name: 'Calling Functions', challenge: { id: 'c_ff_calling_functions', title: 'Invoking Spells: Calling Functions', difficulty: 1, description: 'Practice calling the functions you have defined.', starterCode: defaultStarterCode('Calling Functions'), solutionCriteria: defaultSolutionCriteria('Calling Functions'), isPlaceholder: true } },
                    { id: 'c_ff_return_values', name: 'Return Values', challenge: { id: 'c_ff_return_values', title: 'Harvesting Results: Return Values', difficulty: 1, description: 'Learn how functions return values and how to use them.', starterCode: defaultStarterCode('Return Values'), solutionCriteria: defaultSolutionCriteria('Return Values'), isPlaceholder: true } },
                    { id: 'c_ff_parameters_arguments', name: 'Parameters and Arguments', challenge: { id: 'c_ff_parameters_arguments', title: 'Channeling Power: Parameters & Arguments', difficulty: 1, description: 'Understand the difference between parameters (in definition) and arguments (in call).', starterCode: defaultStarterCode('Parameters & Arguments'), solutionCriteria: defaultSolutionCriteria('Parameters & Arguments'), isPlaceholder: true } },
                ]
            }
        ]
    },
    // Intermediate Topics Start
    {
      id: 'mt_data_structures',
      name: 'Data Structures',
      description: "Organize and manage complex data with JavaScript's versatile data structures.",
      subTopics: [
        {
          id: 'st_ds_keyed_collections', name: 'Keyed Collections',
          concepts: [
            { id: 'c_ds_map_basics', name: 'Map: Fundamentals', challenge: { id: 'c_ds_map_basics', title: 'The Cartographer\'s Scroll: Map Fundamentals', difficulty: 2, description: 'Learn to create, add to (`set`), get from (`get`), and check for keys (`has`) in Map objects.', starterCode: defaultStarterCode('Map Fundamentals'), solutionCriteria: defaultSolutionCriteria('Map Fundamentals'), isPlaceholder: true } },
            { id: 'c_ds_map_iteration', name: 'Map: Iteration', challenge: { id: 'c_ds_map_iteration', title: 'The Cartographer\'s Scroll: Map Iteration', difficulty: 2, description: 'Iterate over Map keys, values, and entries.', starterCode: defaultStarterCode('Map Iteration'), solutionCriteria: defaultSolutionCriteria('Map Iteration'), isPlaceholder: true } },
            { id: 'c_ds_map', name: 'Map: Advanced Usage', challenge: { id: 'c_ds_map', title: 'The Cartographer\'s Scroll: Advanced Map Usage', difficulty: 2, description: defaultDescription('Advanced Map objects usage (e.g., object keys, size)'), starterCode: defaultStarterCode('Advanced Map Usage'), solutionCriteria: defaultSolutionCriteria('Advanced Map Usage'), isPlaceholder: true } },
            { id: 'c_ds_weakmap_basics', name: 'WeakMap: Fundamentals', challenge: { id: 'c_ds_weakmap_basics', title: 'The Fading Parchment: WeakMap Fundamentals', difficulty: 2, description: 'Understand the purpose and basic usage of WeakMap for memory-sensitive keyed collections.', starterCode: defaultStarterCode('WeakMap Fundamentals'), solutionCriteria: defaultSolutionCriteria('WeakMap Fundamentals'), isPlaceholder: true } },
            { id: 'c_ds_weakmap', name: 'WeakMap: Use Cases', challenge: { id: 'c_ds_weakmap', title: 'The Fading Parchment: WeakMap Use Cases', difficulty: 2, description: defaultDescription('Use cases for WeakMap objects'), starterCode: defaultStarterCode('WeakMap Use Cases'), solutionCriteria: defaultSolutionCriteria('WeakMap Use Cases'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_ds_structured_data', name: 'Structured Data',
          concepts: [
            { id: 'c_ds_json_parse', name: 'JSON: Parsing Data', challenge: { id: 'c_ds_json_parse', title: 'Universal Tongue: Parsing JSON', difficulty: 2, description: 'Learn to parse JSON strings into JavaScript objects using `JSON.parse()`.', starterCode: defaultStarterCode('JSON Parsing'), solutionCriteria: defaultSolutionCriteria('JSON Parsing'), isPlaceholder: true } },
            { id: 'c_ds_json_stringify', name: 'JSON: Stringifying Data', challenge: { id: 'c_ds_json_stringify', title: 'Universal Tongue: Stringifying to JSON', difficulty: 2, description: 'Learn to convert JavaScript objects into JSON strings using `JSON.stringify()`.', starterCode: defaultStarterCode('JSON Stringifying'), solutionCriteria: defaultSolutionCriteria('JSON Stringifying'), isPlaceholder: true } },
            { id: 'c_ds_json', name: 'JSON: Advanced Options', challenge: { id: 'c_ds_json', title: 'The Universal Language: JSON Advanced', difficulty: 2, description: defaultDescription('Advanced options with JSON (replacer, space)'), starterCode: defaultStarterCode('JSON Advanced'), solutionCriteria: defaultSolutionCriteria('JSON Advanced'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_ds_sets', name: 'Sets',
          concepts: [
            { id: 'c_ds_set_basics', name: 'Set: Fundamentals', challenge: { id: 'c_ds_set_basics', title: 'The Collector\'s Amulet: Set Fundamentals', difficulty: 2, description: 'Learn to create Sets, add items, check for existence, and understand uniqueness.', starterCode: defaultStarterCode('Set Fundamentals'), solutionCriteria: defaultSolutionCriteria('Set Fundamentals'), isPlaceholder: true } },
            { id: 'c_ds_set_operations', name: 'Set: Operations', challenge: { id: 'c_ds_set_operations', title: 'The Collector\'s Amulet: Set Operations', difficulty: 2, description: 'Explore Set operations like iteration, deletion, and size.', starterCode: defaultStarterCode('Set Operations'), solutionCriteria: defaultSolutionCriteria('Set Operations'), isPlaceholder: true } },
            { id: 'c_ds_set', name: 'Set: Use Cases', challenge: { id: 'c_ds_set', title: 'The Collector\'s Amulet: Set Use Cases', difficulty: 2, description: defaultDescription('Practical use cases for Set objects'), starterCode: defaultStarterCode('Set Use Cases'), solutionCriteria: defaultSolutionCriteria('Set Use Cases'), isPlaceholder: true } },
            { id: 'c_ds_weakset_basics', name: 'WeakSet: Fundamentals', challenge: { id: 'c_ds_weakset_basics', title: 'The Ephemeral Gathering: WeakSet Fundamentals', difficulty: 2, description: 'Understand WeakSet for storing objects weakly and its garbage collection implications.', starterCode: defaultStarterCode('WeakSet Fundamentals'), solutionCriteria: defaultSolutionCriteria('WeakSet Fundamentals'), isPlaceholder: true } },
            { id: 'c_ds_weakset', name: 'WeakSet: Use Cases', challenge: { id: 'c_ds_weakset', title: 'The Ephemeral Gathering: WeakSet Use Cases', difficulty: 2, description: defaultDescription('Practical use cases for WeakSet objects'), starterCode: defaultStarterCode('WeakSet Use Cases'), solutionCriteria: defaultSolutionCriteria('WeakSet Use Cases'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_ds_indexed_collections', name: 'Indexed Collections',
          concepts: [
            { id: 'c_ds_arrays_create_empty', name: 'Arrays: Create Empty', challenge: { 
                id: 'c_ds_arrays_create_empty', title: 'The Royal Heist: The Empty Bag', 
                difficulty: 2, 
                description: 'The Rogue needs a bag for the heist! Create an empty array named `heistBag`.', 
                starterCode: '// const heistBag = ... your code ...', 
                solutionCriteria: (code) => {
                    const res = evaluateCodeAndCheckVariable(code, 'heistBag', 'object'); // Array is an object
                    if (!res.passed) return res;
                    if (Array.isArray(res.evaluatedValue) && res.evaluatedValue.length === 0) {
                        return { passed: true, message: "The `heistBag` is ready and empty!", evaluatedValue: res.evaluatedValue };
                    }
                    return { passed: false, message: "The `heistBag` should be an empty array.", evaluatedValue: res.evaluatedValue };
                },
                visualFeedback: ARRAYS_VISUAL_FEEDBACK,
                isPlaceholder: false 
              } 
            },
            { id: 'c_ds_arrays_push_item', name: 'Arrays: Add First Item', challenge: { 
                id: 'c_ds_arrays_push_item', title: 'The Royal Heist: First Artifact', 
                difficulty: 2, 
                description: 'The first artifact is the "Golden Scepter". Add it to your `heistBag` using the `.push()` method.', 
                starterCode: 'const heistBag = [];\n// Add "Golden Scepter"', 
                solutionCriteria: (code) => {
                    const res = evaluateCodeAndCheckVariable(code, 'heistBag', 'object');
                    if (!res.passed) return res;
                    if (Array.isArray(res.evaluatedValue) && res.evaluatedValue.length === 1 && res.evaluatedValue[0] === "Golden Scepter") {
                        return { passed: true, message: "Golden Scepter secured!", evaluatedValue: res.evaluatedValue };
                    }
                    return { passed: false, message: "Ensure only 'Golden Scepter' is in the bag, added with .push().", evaluatedValue: res.evaluatedValue };
                },
                visualFeedback: ARRAYS_VISUAL_FEEDBACK,
                isPlaceholder: false 
              } 
            },
            { id: 'c_ds_arrays_push_all', name: 'Arrays: All Artifacts (Order Matters!)', challenge: { 
                id: 'c_ds_arrays_push_all', title: 'The Royal Heist: Secure All Artifacts', 
                difficulty: 2, 
                description: 'Secure all three artifacts in this precise order: "Golden Scepter", "Dragon\'s Eye Orb", "Sunstone Amulet". Add them to `heistBag`.', 
                starterCode: 'const heistBag = [];\n// Add all three artifacts in order',
                solutionCriteria: (code) => {
                    const res = evaluateCodeAndCheckVariable(code, 'heistBag', 'object');
                    if (!res.passed) return res;
                    const expected = ["Golden Scepter", "Dragon's Eye Orb", "Sunstone Amulet"];
                    if (Array.isArray(res.evaluatedValue) && 
                        res.evaluatedValue.length === expected.length && 
                        res.evaluatedValue.every((val, index) => val === expected[index])) {
                        return { passed: true, message: "Heist successful! All artifacts secured in order.", evaluatedValue: res.evaluatedValue };
                    }
                    return { passed: false, message: "The artifacts are incorrect, missing, or in the wrong order. The Manifest is precise!", evaluatedValue: res.evaluatedValue };
                },
                hint: "Use `heistBag.push('artifactName');` for each item. The order is: 1. Golden Scepter, 2. Dragon's Eye Orb, 3. Sunstone Amulet.",
                solutionExplanation: "const heistBag = [];\nheistBag.push('Golden Scepter');\nheistBag.push('Dragon\\'s Eye Orb');\nheistBag.push('Sunstone Amulet');",
                visualFeedback: ARRAYS_VISUAL_FEEDBACK,
                isPlaceholder: false 
              } 
            },
            { id: 'c_ds_arrays_methods', name: 'Arrays: Common Methods', challenge: { id: 'c_ds_arrays_methods', title: 'The Rogue\'s Toolkit: Common Array Methods', difficulty: 2, description: 'Explore other common array methods like `pop`, `shift`, `unshift`, `slice`, `splice`.', starterCode: defaultStarterCode('Common Array Methods'), solutionCriteria: defaultSolutionCriteria('Common Array Methods'), isPlaceholder: true } },
            { id: 'c_ds_typed_arrays_basics', name: 'Typed Arrays: Fundamentals', challenge: { id: 'c_ds_typed_arrays_basics', title: 'The Binary Grimoire: Typed Array Fundamentals', difficulty: 2, description: 'Understand what Typed Arrays are and why they are used for binary data.', starterCode: defaultStarterCode('Typed Array Fundamentals'), solutionCriteria: defaultSolutionCriteria('Typed Array Fundamentals'), isPlaceholder: true } },
            { id: 'c_ds_typed_arrays', name: 'Typed Arrays: Usage', challenge: { id: 'c_ds_typed_arrays', title: 'The Binary Grimoire: Typed Arrays Usage', difficulty: 2, description: defaultDescription('Using different Typed Arrays (Int8Array, Float32Array, etc.)'), starterCode: defaultStarterCode('Typed Arrays Usage'), solutionCriteria: defaultSolutionCriteria('Typed Arrays Usage'), isPlaceholder: true } },
          ]
        },
         {
          id: 'st_ds_object_internals', name: 'Object Internals', // Added for Prototypal Inheritance
          concepts: [
            { id: 'c_ds_prototypal_inheritance_basics', name: 'Prototypal Inheritance: Basics', challenge: { id: 'c_ds_prototypal_inheritance_basics', title: 'Ancestral Lines: Prototypal Inheritance Basics', difficulty: 2, description: 'Understand the basic concept of objects inheriting from other objects.', starterCode: defaultStarterCode('Prototypal Inheritance Basics'), solutionCriteria: defaultSolutionCriteria('Prototypal Inheritance Basics'), isPlaceholder: true } },
            { id: 'c_ds_prototypal_inheritance', name: 'Prototypal Inheritance: Chain', challenge: { id: 'c_ds_prototypal_inheritance', title: 'Ancestral Lines: The Prototype Chain', difficulty: 2, description: defaultDescription('Understanding and navigating the prototype chain'), starterCode: defaultStarterCode('The Prototype Chain'), solutionCriteria: defaultSolutionCriteria('The Prototype Chain'), isPlaceholder: true } },
            { id: 'c_ds_object_prototype_role', name: 'Object.prototype: Role', challenge: { id: 'c_ds_object_prototype_role', title: 'The Primogenitor: Role of Object.prototype', difficulty: 2, description: 'Understand the role of `Object.prototype` as the ultimate ancestor.', starterCode: defaultStarterCode('Role of Object.prototype'), solutionCriteria: defaultSolutionCriteria('Role of Object.prototype'), isPlaceholder: true } },
            { id: 'c_ds_object_prototype', name: 'Object.prototype: Methods', challenge: { id: 'c_ds_object_prototype', title: 'The Primogenitor: Common Object.prototype Methods', difficulty: 2, description: defaultDescription('Exploring common methods from Object.prototype (hasOwnProperty, toString)'), starterCode: defaultStarterCode('Object.prototype Methods'), solutionCriteria: defaultSolutionCriteria('Object.prototype Methods'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_ds_builtin_objects', name: 'Built-in Objects',
          concepts: [
            { id: 'c_ds_builtin_date', name: 'Date Object', challenge: { id: 'c_ds_builtin_date', title: 'The Chronomancer\'s Tool: Date Object', difficulty: 2, description: 'Learn to work with dates and times using the `Date` object.', starterCode: defaultStarterCode('Date Object'), solutionCriteria: defaultSolutionCriteria('Date Object'), isPlaceholder: true } },
            { id: 'c_ds_builtin_math', name: 'Math Object', challenge: { id: 'c_ds_builtin_math', title: 'The Arithmetician\'s Aid: Math Object', difficulty: 2, description: 'Utilize properties and methods of the `Math` object.', starterCode: defaultStarterCode('Math Object'), solutionCriteria: defaultSolutionCriteria('Math Object'), isPlaceholder: true } },
            { id: 'c_ds_builtin_regexp', name: 'RegExp Object', challenge: { id: 'c_ds_builtin_regexp', title: 'The Pattern Weaver: RegExp Object', difficulty: 2, description: 'Introduction to regular expressions for pattern matching.', starterCode: defaultStarterCode('RegExp Object'), solutionCriteria: defaultSolutionCriteria('RegExp Object'), isPlaceholder: true } },
            { id: 'c_ds_builtin_overview', name: 'Other Built-in Objects', challenge: { id: 'c_ds_builtin_overview', title: 'The Pantheon: Other Built-ins', difficulty: 2, description: defaultDescription('Brief overview of other standard built-in objects (Error, JSON, etc.)'), starterCode: defaultStarterCode('Other Built-in Objects'), solutionCriteria: defaultSolutionCriteria('Other Built-in Objects'), isPlaceholder: true } },
          ]
        },
      ]
    },
    {
      id: 'mt_functions_advanced',
      name: 'Functions - Advanced Techniques',
      description: "Delve deeper into the art of function crafting with advanced parameters, scopes, and execution contexts.",
      subTopics: [
        {
          id: 'st_fa_parameters', name: 'Function Parameters',
          concepts: [
            { id: 'c_fa_params_review', name: 'Parameters: Review', challenge: { id: 'c_fa_params_review', title: 'Function Parameters: The Basics Reviewed', difficulty: 2, description: 'A quick review of basic function parameters and arguments.', starterCode: defaultStarterCode('Parameters Review'), solutionCriteria: defaultSolutionCriteria('Parameters Review'), isPlaceholder: true } },
            { id: 'c_fa_default_params', name: 'Default Params', challenge: { id: 'c_fa_default_params', title: 'Prepared Incantations: Default Parameters', difficulty: 2, description: defaultDescription('Default Function Parameters'), starterCode: defaultStarterCode('Default Params'), solutionCriteria: defaultSolutionCriteria('Default Params'), isPlaceholder: true } },
            { id: 'c_fa_rest_params', name: 'Rest Params', challenge: { id: 'c_fa_rest_params', title: 'Gathering Energies: Rest Parameters', difficulty: 2, description: defaultDescription('Rest Parameters for variadic functions'), starterCode: defaultStarterCode('Rest Params'), solutionCriteria: defaultSolutionCriteria('Rest Params'), isPlaceholder: true } },
            { id: 'c_fa_params_destructuring', name: 'Parameter Destructuring', challenge: { id: 'c_fa_params_destructuring', title: 'Unpacking Gifts: Parameter Destructuring', difficulty: 2, description: 'Using destructuring with object and array parameters.', starterCode: defaultStarterCode('Parameter Destructuring'), solutionCriteria: defaultSolutionCriteria('Parameter Destructuring'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_fa_arrow_iife', name: 'Arrow Functions & IIFEs',
          concepts: [
            { id: 'c_fa_arrow_functions_syntax', name: 'Arrow Functions: Syntax', challenge: { id: 'c_fa_arrow_functions_syntax', title: 'Swift Spells: Arrow Function Syntax', difficulty: 2, description: 'Learn the various syntaxes of arrow functions.', starterCode: defaultStarterCode('Arrow Function Syntax'), solutionCriteria: defaultSolutionCriteria('Arrow Function Syntax'), isPlaceholder: true } },
            { id: 'c_fa_arrow_functions_this', name: 'Arrow Functions: `this` Behavior', challenge: { id: 'c_fa_arrow_functions_this', title: 'Swift Spells: Arrow Function `this`', difficulty: 2, description: 'Understand the lexical `this` binding in arrow functions.', starterCode: defaultStarterCode('Arrow Function `this`'), solutionCriteria: defaultSolutionCriteria('Arrow Function `this`'), isPlaceholder: true } },
            { id: 'c_fa_arrow_functions', name: 'Arrow Functions: Use Cases', challenge: { id: 'c_fa_arrow_functions', title: 'Swift Spells: Arrow Function Use Cases', difficulty: 2, description: defaultDescription('Common use cases for Arrow Functions'), starterCode: defaultStarterCode('Arrow Function Use Cases'), solutionCriteria: defaultSolutionCriteria('Arrow Function Use Cases'), isPlaceholder: true } },
            { id: 'c_fa_iifes_syntax', name: 'IIFEs: Syntax', challenge: { id: 'c_fa_iifes_syntax', title: 'Self-Contained Rituals: IIFE Syntax', difficulty: 2, description: 'Understand the syntax for creating Immediately Invoked Function Expressions.', starterCode: defaultStarterCode('IIFE Syntax'), solutionCriteria: defaultSolutionCriteria('IIFE Syntax'), isPlaceholder: true } },
            { id: 'c_fa_iifes', name: 'IIFEs: Use Cases', challenge: { id: 'c_fa_iifes', title: 'Self-Contained Rituals: IIFE Use Cases', difficulty: 2, description: defaultDescription('Common use cases for IIFEs (e.g., creating private scope)'), starterCode: defaultStarterCode('IIFE Use Cases'), solutionCriteria: defaultSolutionCriteria('IIFE Use Cases'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_fa_scope_stack_context', name: 'Scope, Stack & Context',
          concepts: [
            { id: 'c_fa_arguments_object', name: '`arguments` object', challenge: { id: 'c_fa_arguments_object', title: 'The Old Ways: `arguments` object', difficulty: 2, description: defaultDescription('The `arguments` object in functions (non-arrow)'), starterCode: defaultStarterCode('arguments object'), solutionCriteria: defaultSolutionCriteria('arguments object'), isPlaceholder: true } },
            { id: 'c_fa_scope_function_stack', name: 'Scope & Function Stack', challenge: { id: 'c_fa_scope_function_stack', title: 'Layers of Magic: Scope & Function Stack', difficulty: 2, description: defaultDescription('Understanding Scope and the Function Stack execution'), starterCode: defaultStarterCode('Scope & Stack'), solutionCriteria: defaultSolutionCriteria('Scope & Stack'), isPlaceholder: true } },
            { id: 'c_fa_recursion_basics', name: 'Recursion: Basics', challenge: { id: 'c_fa_recursion_basics', title: 'The Endless Loop: Recursion Basics', difficulty: 2, description: 'Understand the concept of a function calling itself and base cases.', starterCode: defaultStarterCode('Recursion Basics'), solutionCriteria: defaultSolutionCriteria('Recursion Basics'), isPlaceholder: true } },
            { id: 'c_fa_recursion', name: 'Recursion: Examples', challenge: { id: 'c_fa_recursion', title: 'The Endless Loop: Recursion Examples', difficulty: 2, description: defaultDescription('Examples of recursive functions (e.g., factorial, fibonacci)'), starterCode: defaultStarterCode('Recursion Examples'), solutionCriteria: defaultSolutionCriteria('Recursion Examples'), isPlaceholder: true } },
            { id: 'c_fa_lexical_scoping', name: 'Lexical Scoping', challenge: { id: 'c_fa_lexical_scoping', title: 'Bound by Birth: Lexical Scoping', difficulty: 2, description: defaultDescription('Lexical Scoping (Static Scope) and how it determines variable access'), starterCode: defaultStarterCode('Lexical Scoping'), solutionCriteria: defaultSolutionCriteria('Lexical Scoping'), isPlaceholder: true } },
            { id: 'c_fa_closures_basics', name: 'Closures: Basics', challenge: { id: 'c_fa_closures_basics', title: 'Trapped Essences: Closures Basics', difficulty: 2, description: 'Understand how inner functions retain access to their outer function\'s scope.', starterCode: defaultStarterCode('Closures Basics'), solutionCriteria: defaultSolutionCriteria('Closures Basics'), isPlaceholder: true } },
            { id: 'c_fa_closures', name: 'Closures: Use Cases', challenge: { id: 'c_fa_closures', title: 'Trapped Essences: Closures Use Cases', difficulty: 2, description: defaultDescription('Practical use cases for Closures (e.g., private variables, function factories)'), starterCode: defaultStarterCode('Closures Use Cases'), solutionCriteria: defaultSolutionCriteria('Closures Use Cases'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_fa_builtin_functions', name: 'Built-in Functions',
          concepts: [
            { id: 'c_fa_exploring_builtin_common', name: 'Common Built-in Functions', challenge: { id: 'c_fa_exploring_builtin_common', title: 'Standard Library: Common Built-ins', difficulty: 2, description: 'Explore common built-in JavaScript functions like `parseInt`, `parseFloat`, `isNaN`, `isFinite`.', starterCode: defaultStarterCode('Common Built-in Functions'), solutionCriteria: defaultSolutionCriteria('Common Built-in Functions'), isPlaceholder: true } },
            { id: 'c_fa_exploring_builtin', name: 'Advanced Built-in Functions', challenge: { id: 'c_fa_exploring_builtin', title: 'The Standard Library: Advanced Built-ins', difficulty: 2, description: defaultDescription('Exploring more advanced or less common built-in functions'), starterCode: defaultStarterCode('Advanced Built-in Functions'), solutionCriteria: defaultSolutionCriteria('Advanced Built-in Functions'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_fa_this_keyword', name: 'Using `this` keyword',
          concepts: [
            { id: 'c_fa_this_intro', name: '`this`: Introduction', challenge: { id: 'c_fa_this_intro', title: 'The Elusive Self: `this` Introduction', difficulty: 2, description: 'Understand that `this` refers to the execution context.', starterCode: defaultStarterCode('`this` Introduction'), solutionCriteria: defaultSolutionCriteria('`this` Introduction'), isPlaceholder: true } },
            { id: 'c_fa_this_method', name: '`this` in a method', challenge: { id: 'c_fa_this_method', title: 'Self-Reference: `this` in Methods', difficulty: 2, description: defaultDescription('`this` keyword in object methods refers to the object itself'), starterCode: defaultStarterCode('this in method'), solutionCriteria: defaultSolutionCriteria('this in method'), isPlaceholder: true } },
            { id: 'c_fa_this_function', name: '`this` in a function (default)', challenge: { id: 'c_fa_this_function', title: 'The Global `this`: `this` in Functions (Default Binding)', difficulty: 2, description: defaultDescription('`this` keyword in regular functions (global object in non-strict, undefined in strict)'), starterCode: defaultStarterCode('this in function (default)'), solutionCriteria: defaultSolutionCriteria('this in function (default)'), isPlaceholder: true } },
            { id: 'c_fa_this_alone', name: '`this` using it alone', challenge: { id: 'c_fa_this_alone', title: 'The Solitary `this`: `this` Alone (Global Object)', difficulty: 2, description: defaultDescription('`this` keyword used alone in the global scope'), starterCode: defaultStarterCode('this alone'), solutionCriteria: defaultSolutionCriteria('this alone'), isPlaceholder: true } },
            { id: 'c_fa_this_event', name: '`this` in event handlers', challenge: { id: 'c_fa_this_event', title: 'Responsive `this`: `this` in Event Handlers', difficulty: 2, description: defaultDescription('`this` keyword behavior in DOM event handlers'), starterCode: defaultStarterCode('this in event handlers'), solutionCriteria: defaultSolutionCriteria('this in event handlers'), isPlaceholder: true } },
            { id: 'c_fa_this_arrow', name: '`this` in arrow functions (lexical)', challenge: { id: 'c_fa_this_arrow', title: 'The Unwavering `this`: `this` in Arrow Functions (Lexical `this`)', difficulty: 2, description: defaultDescription('`this` keyword behavior in arrow functions (lexically bound)'), starterCode: defaultStarterCode('this in arrow functions'), solutionCriteria: defaultSolutionCriteria('this in arrow functions'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_fa_function_borrowing', name: 'Function Borrowing',
          concepts: [
            { id: 'c_fa_fb_intro', name: 'Function Borrowing: Concept', challenge: { id: 'c_fa_fb_intro', title: 'Borrowed Power: The Concept', difficulty: 2, description: 'Understand why and when you might want to borrow methods.', starterCode: defaultStarterCode('Function Borrowing Concept'), solutionCriteria: defaultSolutionCriteria('Function Borrowing Concept'), isPlaceholder: true } },
            { id: 'c_fa_call', name: '`call`', challenge: { id: 'c_fa_call', title: 'Borrowed Power: `call`', difficulty: 2, description: defaultDescription('Using `Function.prototype.call` to invoke a function with a specified `this` value and arguments provided individually.'), starterCode: defaultStarterCode('call'), solutionCriteria: defaultSolutionCriteria('call'), isPlaceholder: true } },
            { id: 'c_fa_apply', name: '`apply`', challenge: { id: 'c_fa_apply', title: 'Flexible Casting: `apply`', difficulty: 2, description: defaultDescription('Using `Function.prototype.apply` to invoke a function with a specified `this` value and arguments provided as an array.'), starterCode: defaultStarterCode('apply'), solutionCriteria: defaultSolutionCriteria('apply'), isPlaceholder: true } },
            { id: 'c_fa_bind', name: '`bind`', challenge: { id: 'c_fa_bind', title: 'Bound Essence: `bind`', difficulty: 2, description: defaultDescription('Using `Function.prototype.bind` to create a new function with a bound `this` value and pre-set arguments.'), starterCode: defaultStarterCode('bind'), solutionCriteria: defaultSolutionCriteria('bind'), isPlaceholder: true } },
            { id: 'c_fa_fb_use_cases', name: 'Function Borrowing: Use Cases', challenge: { id: 'c_fa_fb_use_cases', title: 'Borrowed Power: Practical Scenarios', difficulty: 2, description: 'Explore practical scenarios where call, apply, and bind are useful.', starterCode: defaultStarterCode('Function Borrowing Use Cases'), solutionCriteria: defaultSolutionCriteria('Function Borrowing Use Cases'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_fa_strict_mode', name: 'Strict Mode',
          concepts: [
            { id: 'c_fa_strict_mode_intro', name: 'Strict Mode: Introduction', challenge: { id: 'c_fa_strict_mode_intro', title: 'The Disciplined Path: Intro to Strict Mode', difficulty: 2, description: 'What is "use strict"; and why is it used?', starterCode: defaultStarterCode('Strict Mode Intro'), solutionCriteria: defaultSolutionCriteria('Strict Mode Intro'), isPlaceholder: true } },
            { id: 'c_fa_strict_mode_usage', name: 'Strict Mode: Changes & Benefits', challenge: { id: 'c_fa_strict_mode_usage', title: 'The Disciplined Path: Changes in Strict Mode', difficulty: 2, description: defaultDescription('Key changes and benefits of using "use strict"; (e.g., error reporting, preventing accidental globals)'), starterCode: defaultStarterCode('Strict Mode Changes'), solutionCriteria: defaultSolutionCriteria('Strict Mode Changes'), isPlaceholder: true } },
          ]
        }
      ]
    },
    {
      id: 'mt_async_javascript',
      name: 'Asynchronous JavaScript',
      description: "Master the flow of time with asynchronous operations, crucial for responsive spellcasting.",
      subTopics: [
        {
          id: 'st_async_event_loop', name: 'Event Loop',
          concepts: [
            { id: 'c_async_el_intro', name: 'Event Loop: Introduction', challenge: { id: 'c_async_el_intro', title: 'The Wheel of Time: Intro to Event Loop', difficulty: 2, description: 'Understand the concept of synchronous vs. asynchronous JavaScript.', starterCode: defaultStarterCode('Event Loop Intro'), solutionCriteria: defaultSolutionCriteria('Event Loop Intro'), isPlaceholder: true } },
            { id: 'c_async_event_loop_mech', name: 'Event Loop: Mechanics', challenge: { id: 'c_async_event_loop_mech', title: 'The Wheel of Time: Event Loop Mechanics', difficulty: 2, description: defaultDescription('Understanding the JavaScript Event Loop (Call Stack, Web APIs, Callback Queue, Event Loop itself)'), starterCode: defaultStarterCode('Event Loop Mechanics'), solutionCriteria: defaultSolutionCriteria('Event Loop Mechanics'), isPlaceholder: true } },
            { id: 'c_async_settimeout', name: '`setTimeout`', challenge: { id: 'c_async_settimeout', title: 'Delayed Incantations: `setTimeout`', difficulty: 2, description: defaultDescription('Using `setTimeout` for delayed execution and its interaction with the event loop'), starterCode: defaultStarterCode('setTimeout'), solutionCriteria: defaultSolutionCriteria('setTimeout'), isPlaceholder: true } },
            { id: 'c_async_setinterval', name: '`setInterval`', challenge: { id: 'c_async_setinterval', title: 'Rhythmic Pulses: `setInterval`', difficulty: 2, description: defaultDescription('Using `setInterval` for repeated execution and managing intervals'), starterCode: defaultStarterCode('setInterval'), solutionCriteria: defaultSolutionCriteria('setInterval'), isPlaceholder: true } },
            { id: 'c_async_el_advanced', name: 'Event Loop: Advanced Scenarios', challenge: { id: 'c_async_el_advanced', title: 'The Wheel of Time: Advanced Scenarios', difficulty: 3, description: 'Microtasks (Promises) vs Macrotasks (setTimeout) and their order of execution.', starterCode: defaultStarterCode('Event Loop Advanced'), solutionCriteria: defaultSolutionCriteria('Event Loop Advanced'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_async_callbacks', name: 'Callbacks',
          concepts: [
            { id: 'c_async_callbacks_intro', name: 'Callbacks: Fundamentals', challenge: { id: 'c_async_callbacks_intro', title: 'Passing the Baton: Callback Fundamentals', difficulty: 2, description: defaultDescription('Using callback functions for asynchronous operations, passing functions as arguments'), starterCode: defaultStarterCode('Callback Fundamentals'), solutionCriteria: defaultSolutionCriteria('Callback Fundamentals'), isPlaceholder: true } },
            { id: 'c_async_callback_hell', name: 'Callback Hell', challenge: { id: 'c_async_callback_hell', title: 'The Tangled Web: Callback Hell', difficulty: 2, description: defaultDescription('Understanding and identifying Callback Hell (Pyramid of Doom)'), starterCode: defaultStarterCode('Callback Hell'), solutionCriteria: defaultSolutionCriteria('Callback Hell'), isPlaceholder: true } },
            { id: 'c_async_callbacks_solutions', name: 'Callback Hell: Solutions', challenge: { id: 'c_async_callbacks_solutions', title: 'Untangling the Web: Avoiding Callback Hell', difficulty: 2, description: 'Strategies to mitigate callback hell (e.g., named functions, modules).', starterCode: defaultStarterCode('Avoiding Callback Hell'), solutionCriteria: defaultSolutionCriteria('Avoiding Callback Hell'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_async_promises', name: 'Promises',
          concepts: [
            { id: 'c_async_promises_intro', name: 'Promises: Introduction', challenge: { id: 'c_async_promises_intro', title: 'Oaths of Execution: Introduction to Promises', difficulty: 2, description: defaultDescription('Understanding Promises as objects representing eventual completion or failure of an async operation'), starterCode: defaultStarterCode('Promises Introduction'), solutionCriteria: defaultSolutionCriteria('Promises Introduction'), isPlaceholder: true } },
            { id: 'c_async_promises_then_catch_finally', name: 'Promises: `.then()`, `.catch()`, `.finally()`', challenge: { id: 'c_async_promises_then_catch_finally', title: 'Oaths of Execution: Chaining Promises', difficulty: 2, description: 'Using `.then()` for success, `.catch()` for errors, and `.finally()` for cleanup.', starterCode: defaultStarterCode('Promise Chaining'), solutionCriteria: defaultSolutionCriteria('Promise Chaining'), isPlaceholder: true } },
            { id: 'c_async_promises_all_race', name: 'Promises: `Promise.all()`, `Promise.race()`', challenge: { id: 'c_async_promises_all_race', title: 'Oaths of Execution: Promise Combinators', difficulty: 3, description: 'Using `Promise.all()` to handle multiple promises concurrently and `Promise.race()` for the first settled promise.', starterCode: defaultStarterCode('Promise Combinators'), solutionCriteria: defaultSolutionCriteria('Promise Combinators'), isPlaceholder: true } },
            { id: 'c_async_async_await_basics', name: '`async`/`await`: Basics', challenge: { id: 'c_async_async_await_basics', title: 'Elegant Waits: `async`/`await` Basics', difficulty: 2, description: 'Using `async` functions to write asynchronous code that looks synchronous, and `await` to pause execution until a Promise settles.', starterCode: defaultStarterCode('async/await Basics'), solutionCriteria: defaultSolutionCriteria('async/await Basics'), isPlaceholder: true } },
            { id: 'c_async_async_await_error_handling', name: '`async`/`await`: Error Handling', challenge: { id: 'c_async_async_await_error_handling', title: 'Elegant Waits: Error Handling with `async`/`await`', difficulty: 2, description: 'Using `try...catch` blocks for error handling in `async` functions.', starterCode: defaultStarterCode('async/await Error Handling'), solutionCriteria: defaultSolutionCriteria('async/await Error Handling'), isPlaceholder: true } },
            { id: 'c_async_async_await', name: '`async`/`await`: Advanced Patterns', challenge: { id: 'c_async_async_await', title: 'Elegant Waits: `async`/`await` Advanced', difficulty: 3, description: defaultDescription('Advanced patterns with `async` and `await` (e.g., sequential vs. parallel execution)'), starterCode: defaultStarterCode('async/await Advanced'), solutionCriteria: defaultSolutionCriteria('async/await Advanced'), isPlaceholder: true } },
          ]
        }
      ]
    },
    {
      id: 'mt_modules_js',
      name: 'Modules in JavaScript',
      description: "Organize your spellbook with modules, enabling cleaner, more maintainable code.",
      subTopics: [
        {
          id: 'st_mod_iterators_generators', name: 'Iterators and Generators',
          concepts: [
            { id: 'c_mod_iterators_protocol', name: 'Iterator Protocol', challenge: { id: 'c_mod_iterators_protocol', title: 'Step by Step: The Iterator Protocol', difficulty: 2, description: 'Understand the iterator protocol (`next()` method, `{ value, done }` object).', starterCode: defaultStarterCode('Iterator Protocol'), solutionCriteria: defaultSolutionCriteria('Iterator Protocol'), isPlaceholder: true } },
            { id: 'c_mod_generators_basics', name: 'Generator Functions: Basics', challenge: { id: 'c_mod_generators_basics', title: 'Step by Step: Generator Function Basics', difficulty: 2, description: 'Learn the syntax of generator functions (`function*`) and the `yield` keyword.', starterCode: defaultStarterCode('Generator Basics'), solutionCriteria: defaultSolutionCriteria('Generator Basics'), isPlaceholder: true } },
            { id: 'c_mod_iterators_generators', name: 'Iterators and Generators: Use Cases', challenge: { id: 'c_mod_iterators_generators', title: 'Step by Step: Iterator & Generator Use Cases', difficulty: 3, description: defaultDescription('Practical use cases for Iterators and Generator functions (e.g., custom iterables, infinite sequences)'), starterCode: defaultStarterCode('Iterator/Generator Use Cases'), solutionCriteria: defaultSolutionCriteria('Iterator/Generator Use Cases'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_mod_commonjs', name: 'CommonJS',
          concepts: [
            { id: 'c_mod_commonjs_intro', name: 'CommonJS: Introduction', challenge: { id: 'c_mod_commonjs_intro', title: 'The Node.js Way: Intro to CommonJS', difficulty: 2, description: 'Understand the basics of CommonJS modules (typically used in Node.js).', starterCode: defaultStarterCode('CommonJS Intro'), solutionCriteria: defaultSolutionCriteria('CommonJS Intro'), isPlaceholder: true } },
            { id: 'c_mod_commonjs_usage', name: 'CommonJS: `require` and `module.exports`', challenge: { id: 'c_mod_commonjs_usage', title: 'The Node.js Way: `require` & `module.exports`', difficulty: 2, description: defaultDescription('Using `require` to import modules and `module.exports` to export them in CommonJS.'), starterCode: defaultStarterCode('CommonJS Usage'), solutionCriteria: defaultSolutionCriteria('CommonJS Usage'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_mod_ecmascript', name: 'ECMAScript Modules',
          concepts: [
            { id: 'c_mod_es_intro', name: 'ES Modules: Introduction', challenge: { id: 'c_mod_es_intro', title: 'The Modern Standard: Intro to ES Modules', difficulty: 2, description: 'Understand the basics of ES Modules (used in modern browsers and Node.js).', starterCode: defaultStarterCode('ES Modules Intro'), solutionCriteria: defaultSolutionCriteria('ES Modules Intro'), isPlaceholder: true } },
            { id: 'c_mod_es_import_export', name: 'ES Modules: `import` and `export`', challenge: { id: 'c_mod_es_import_export', title: 'The Modern Standard: `import` & `export` Syntax', difficulty: 2, description: 'Learn named and default exports/imports.', starterCode: defaultStarterCode('ES Modules import/export'), solutionCriteria: defaultSolutionCriteria('ES Modules import/export'), isPlaceholder: true } },
            { id: 'c_mod_ecmascript_usage', name: 'ES Modules: Advanced Usage', challenge: { id: 'c_mod_ecmascript_usage', title: 'The Modern Standard: ES Modules Advanced', difficulty: 3, description: defaultDescription('Advanced ES Module features (e.g., dynamic imports, module resolution)'), starterCode: defaultStarterCode('ES Modules Advanced'), solutionCriteria: defaultSolutionCriteria('ES Modules Advanced'), isPlaceholder: true } },
          ]
        }
      ]
    },
    {
      id: 'mt_chrome_dev_tools',
      name: 'Using Chrome Dev Tools',
      description: "Master the art of scrying with Chrome Dev Tools to debug and optimize your JavaScript spells.",
      subTopics: [
        {
          id: 'st_cdt_debugging_issues', name: 'Debugging Issues',
          concepts: [
            { id: 'c_cdt_console_usage', name: 'Console: Effective Usage', challenge: { id: 'c_cdt_console_usage', title: 'The Inspector\'s Lens: Mastering the Console', difficulty: 2, description: 'Using `console.log`, `warn`, `error`, `table`, `group` for effective debugging.', starterCode: defaultStarterCode('Console Usage'), solutionCriteria: defaultSolutionCriteria('Console Usage'), isPlaceholder: true } },
            { id: 'c_cdt_breakpoints', name: 'Breakpoints & Stepping', challenge: { id: 'c_cdt_breakpoints', title: 'The Inspector\'s Lens: Breakpoints & Code Stepping', difficulty: 2, description: 'Using breakpoints, step over, step into, step out for debugging.', starterCode: defaultStarterCode('Breakpoints & Stepping'), solutionCriteria: defaultSolutionCriteria('Breakpoints & Stepping'), isPlaceholder: true } },
            { id: 'c_cdt_debugging_basic', name: 'Advanced Debugging Techniques', challenge: { id: 'c_cdt_debugging_basic', title: 'The Inspector\'s Lens: Advanced Debugging', difficulty: 3, description: defaultDescription('Advanced debugging: Watch expressions, call stack, conditional breakpoints.'), starterCode: defaultStarterCode('Advanced Debugging'), solutionCriteria: defaultSolutionCriteria('Advanced Debugging'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_cdt_memory_leaks', name: 'Debugging Memory Leaks',
          concepts: [
            { id: 'c_cdt_memory_leaks_intro', name: 'Memory Leaks: Introduction', challenge: { id: 'c_cdt_memory_leaks_intro', title: 'Finding Lost Souls: Intro to Memory Leaks', difficulty: 2, description: 'What are memory leaks and why are they problematic?', starterCode: defaultStarterCode('Memory Leaks Intro'), solutionCriteria: defaultSolutionCriteria('Memory Leaks Intro'), isPlaceholder: true } },
            { id: 'c_cdt_memory_leaks_detect', name: 'Detecting Memory Leaks with DevTools', challenge: { id: 'c_cdt_memory_leaks_detect', title: 'Finding Lost Souls: Detecting Leaks', difficulty: 3, description: defaultDescription('Using Chrome Dev Tools (Memory tab, Heap Snapshots) to detect memory leaks.'), starterCode: defaultStarterCode('Detecting Memory Leaks'), solutionCriteria: defaultSolutionCriteria('Detecting Memory Leaks'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_cdt_performance', name: 'Debugging Performance',
          concepts: [
            { id: 'c_cdt_performance_intro', name: 'Performance Profiling: Introduction', challenge: { id: 'c_cdt_performance_intro', title: 'Optimizing Flow: Intro to Performance Profiling', difficulty: 2, description: 'Why performance matters and an overview of the Performance panel.', starterCode: defaultStarterCode('Performance Intro'), solutionCriteria: defaultSolutionCriteria('Performance Intro'), isPlaceholder: true } },
            { id: 'c_cdt_performance_profile', name: 'Performance Profiling: Usage', challenge: { id: 'c_cdt_performance_profile', title: 'Optimizing Flow: Using the Performance Profiler', difficulty: 3, description: defaultDescription('Recording and analyzing performance profiles in Chrome Dev Tools to find bottlenecks.'), starterCode: defaultStarterCode('Performance Profiling Usage'), solutionCriteria: defaultSolutionCriteria('Performance Profiling Usage'), isPlaceholder: true } },
          ]
        }
      ]
    },
    {
      id: 'mt_classes',
      name: 'Classes',
      description: "Structure your code with Classes, a blueprint for creating powerful objects.",
      subTopics: [
        {
          id: 'st_cls_introduction', name: 'Introduction to Classes',
          concepts: [
            { id: 'c_cls_basic_syntax', name: 'Class Syntax & Constructors', challenge: { id: 'c_cls_basic_syntax', title: 'The Blueprint: Class Syntax & Constructors', difficulty: 2, description: defaultDescription('Basic class syntax, the `constructor` method, and creating instances.'), starterCode: defaultStarterCode('Class Syntax & Constructors'), solutionCriteria: defaultSolutionCriteria('Class Syntax & Constructors'), isPlaceholder: true } },
            { id: 'c_cls_methods', name: 'Class Methods', challenge: { id: 'c_cls_methods', title: 'The Blueprint: Defining Class Methods', difficulty: 2, description: 'Adding methods to classes.', starterCode: defaultStarterCode('Class Methods'), solutionCriteria: defaultSolutionCriteria('Class Methods'), isPlaceholder: true } },
          ]
        },
        {
            id: 'st_cls_inheritance', name: 'Inheritance',
            concepts: [
                 { id: 'c_cls_inheritance_extends', name: 'Inheritance: `extends` and `super`', challenge: { id: 'c_cls_inheritance_extends', title: 'Building on Blueprints: `extends` & `super`', difficulty: 2, description: 'Using `extends` for inheritance and `super()` to call parent constructors/methods.', starterCode: defaultStarterCode('Class Inheritance'), solutionCriteria: defaultSolutionCriteria('Class Inheritance'), isPlaceholder: true } },
            ]
        },
        {
            id: 'st_cls_advanced', name: 'Advanced Class Features',
            concepts: [
                 { id: 'c_cls_getters_setters', name: 'Getters and Setters', challenge: { id: 'c_cls_getters_setters', title: 'Controlled Access: Getters & Setters', difficulty: 3, description: 'Defining getter and setter methods in classes.', starterCode: defaultStarterCode('Class Getters/Setters'), solutionCriteria: defaultSolutionCriteria('Class Getters/Setters'), isPlaceholder: true } },
                 { id: 'c_cls_static_methods_props', name: 'Static Methods and Properties', challenge: { id: 'c_cls_static_methods_props', title: 'Class-Level Magic: Static Methods & Properties', difficulty: 3, description: 'Understanding and using static methods and properties.', starterCode: defaultStarterCode('Static Methods/Properties'), solutionCriteria: defaultSolutionCriteria('Static Methods/Properties'), isPlaceholder: true } },
                 { id: 'c_cls_private_fields_methods', name: 'Private Class Features', challenge: { id: 'c_cls_private_fields_methods', title: 'Secret Chambers: Private Class Fields & Methods', difficulty: 3, description: 'Using `#` for private class fields and methods (newer feature).', starterCode: defaultStarterCode('Private Class Features'), solutionCriteria: defaultSolutionCriteria('Private Class Features'), isPlaceholder: true } },
            ]
        }
      ]
    },
    // Advanced Topics Start
    {
      id: 'mt_memory_management',
      name: 'Memory Management',
      description: "Understand how JavaScript manages memory, a key to writing efficient and robust applications.",
      subTopics: [
        {
          id: 'st_mm_lifecycle', name: 'Memory Lifecycle',
          concepts: [
            { id: 'c_mm_lifecycle_stages_intro', name: 'Memory Lifecycle: Introduction', challenge: { id: 'c_mm_lifecycle_stages_intro', title: 'The Cycle of Essence: Intro to Memory Lifecycle', difficulty: 3, description: 'Overview of the memory lifecycle in programming.', starterCode: defaultStarterCode('Memory Lifecycle Intro'), solutionCriteria: defaultSolutionCriteria('Memory Lifecycle Intro'), isPlaceholder: true } },
            { id: 'c_mm_lifecycle_stages', name: 'Memory Lifecycle: In JavaScript', challenge: { id: 'c_mm_lifecycle_stages', title: 'The Cycle of Essence: Lifecycle in JS', difficulty: 3, description: defaultDescription('Understanding the memory lifecycle (allocate, use, release) specifically in JavaScript.'), starterCode: defaultStarterCode('Memory Lifecycle in JS'), solutionCriteria: defaultSolutionCriteria('Memory Lifecycle in JS'), isPlaceholder: true } },
          ]
        },
        {
          id: 'st_mm_garbage_collection', name: 'Garbage Collection',
          concepts: [
            { id: 'c_mm_gc_intro', name: 'Garbage Collection: Introduction', challenge: { id: 'c_mm_gc_intro', title: 'The Soul Reclaimer: Intro to Garbage Collection', difficulty: 3, description: 'What is garbage collection and why is it needed?', starterCode: defaultStarterCode('GC Intro'), solutionCriteria: defaultSolutionCriteria('GC Intro'), isPlaceholder: true } },
            { id: 'c_mm_garbage_collection_algo', name: 'Garbage Collection: Mark-and-Sweep', challenge: { id: 'c_mm_garbage_collection_algo', title: 'The Soul Reclaimer: Mark-and-Sweep', difficulty: 3, description: defaultDescription('Understanding common GC algorithms like Mark-and-Sweep used in JavaScript engines.'), starterCode: defaultStarterCode('GC Mark-and-Sweep'), solutionCriteria: defaultSolutionCriteria('GC Mark-and-Sweep'), isPlaceholder: true } },
            { id: 'c_mm_gc_implications', name: 'Garbage Collection: Implications', challenge: { id: 'c_mm_gc_implications', title: 'The Soul Reclaimer: GC Implications', difficulty: 3, description: 'How GC can impact performance and writing GC-friendly code.', starterCode: defaultStarterCode('GC Implications'), solutionCriteria: defaultSolutionCriteria('GC Implications'), isPlaceholder: true } },
          ]
        }
      ]
    }
];

export const jsMasteryCurriculum: Curriculum = {
  id: 'js_mastery_path',
  name: 'JavaScript Mastery Path',
  mainTopics: staticMainTopics.map(mainTopic => {
      mainTopic.subTopics.forEach(subTopic => {
          if (subTopic.concepts.length === 0) {
              const conceptId = `c_${subTopic.id}_fundamentals`;
              const conceptName = `${subTopic.name}: Fundamentals`;
              let difficultyValue: 1 | 2 | 3 = 2;
              if (mainTopic.id.includes('_intro_') || mainTopic.name.toLowerCase().includes('beginner') || mainTopic.name.toLowerCase().includes('foundations')) {
                difficultyValue = 1;
              } else if (mainTopic.name.toLowerCase().includes('advanced') || mainTopic.id.includes('_memory_') || mainTopic.id.includes('_classes_adv')) {
                 difficultyValue = 3; 
              }

              subTopic.concepts.push({
                  id: conceptId,
                  name: conceptName,
                  challenge: {
                      id: conceptId,
                      title: `The Core of ${subTopic.name}`,
                      description: defaultDescription(conceptName),
                      difficulty: difficultyValue,
                      starterCode: defaultStarterCode(conceptName),
                      solutionCriteria: defaultSolutionCriteria(conceptName),
                      isPlaceholder: true,
                  }
              });
          }
      });
      return mainTopic;
  }),
};

// For App.tsx to use a consistent named export for the curriculum
export const INITIAL_CURRICULUM = jsMasteryCurriculum;
// Ensure the file ends with a newline character.
