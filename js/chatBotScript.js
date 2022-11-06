window.myState= {};
window.myState.firstMessage= false;
window.myState.chatBoxStart;
window.myState.MaxWaitingQueue;
window.myState.AvgMeetingDuration;
window.myState.currentQueue;
window.myState.meeting_url;

const BACKEND_HOST= 'https://demosacsgr-backoffice.azurewebsites.net'

const updateChatboxConfiguration= async function () {
  const REQ_URL = `${BACKEND_HOST}/api/get-settings/`;

  const REQ_HEADERS = {
  };

  const res = await fetch(REQ_URL, {
    method: 'GET',
    headers: REQ_HEADERS,
    redirect: 'follow'
  })
    // .then(response => response.text())
    .then(response => response.json())
    .catch(error => console.log(error));

    window.myState.chatBoxStart= res.chatBoxStart;
    window.myState.MaxWaitingQueue= res.maxWaitingQueue;
    window.myState.AvgMeetingDuration= res.avgMeetingDuration;
}

updateChatboxConfiguration();

const updateCurrentQueue= async function () {
  const REQ_URL = `${BACKEND_HOST}/api/get-current-queue/`;

  const REQ_HEADERS = {
  };

  const res = await fetch(REQ_URL, {
    method: 'GET',
    headers: REQ_HEADERS,
    redirect: 'follow'
  })
    // .then(response => response.text())
    .then(response => response.json())
    .catch(error => console.log(error));

    window.myState.currentQueue= res.currentQueue;
}

const sendMeetingRequest= async function (form_name, form_surname, form_mobile, form_email, form_afm, form_klidarithmos, form_details) {
  const REQ_URL = `${BACKEND_HOST}/api/create-meeting/`;

  const REQ_HEADERS = {
    "Content-Type": "application/json"
  };
  
  const REQ_BODY = JSON.stringify({
    "form_name": form_name,
    "form_surname": form_surname,
    "form_mobile": form_mobile,
    "form_email": form_email,
    "form_afm": form_afm,
    "form_klidarithmos": form_klidarithmos,
    "form_details": form_details
  });

  const res = await fetch(REQ_URL, {
    method: 'POST',
    headers: REQ_HEADERS,
    body: REQ_BODY,
    redirect: 'follow'
  });

  if (res.status!= 200){
    console.error(await res.text());
    return {};
  } else {
    return await res.json()
  }
    // .then(response => response.text())
    // .then(response => response.json())
    // .catch(error => console.log(error));

}


const getTime= function () {
  const d = new Date();
  const hr = d.getHours();
  let min = d.getMinutes();
  if (min < 10) {
    min = "0" + min;
  }
  return hr + ":" + min;
}

const postMsgFromBot= function (msg) {
  const bubbleElement= document.getElementById("BotChatBubble").cloneNode(true);
  const timeElement= bubbleElement.getElementsByClassName("BotChatTime")[0];
  const msgElement= bubbleElement.getElementsByClassName("BotChatMsg")[0];

  timeElement.innerHTML= getTime();
  msgElement.innerHTML= msg;

  bubbleElement.classList.remove("myHidden");
  const chatBoxElement= document.getElementById("ChatBox");
  chatBoxElement.appendChild(bubbleElement);
  chatBoxElement.scrollTop = chatBoxElement.scrollHeight;
}

const postMsgFromUser= function (msg) {
  const bubbleElement= document.getElementById("UserChatBubble").cloneNode(true);
  const timeElement= bubbleElement.getElementsByClassName("UserChatTime")[0];
  const msgElement= bubbleElement.getElementsByClassName("UserChatMsg")[0];

  timeElement.innerHTML= getTime();
  msgElement.innerHTML= msg;

  bubbleElement.classList.remove("myHidden");
  const chatBoxElement= document.getElementById("ChatBox");
  chatBoxElement.appendChild(bubbleElement);
  chatBoxElement.scrollTop = chatBoxElement.scrollHeight;
}

const postBotGreetingMsg= function () {
  const element= BotGreetingMsgHTML;
  postMsgFromBot(element);

  document.getElementById("btnSubmitRequest").onclick= () => {
    postBotFormgMsg();
    document.getElementById("btnSubmitRequest").classList.add("myDisabledButton");
  }
}

const postBotClosedChatboxMsg= function () {
  const element= BotClosedChatboxMsgHTML;
  postMsgFromBot(element);
}

const postBotErrorCreatingMsg= function () {
  const element= BotErrorCreatingMsgHTML;
  postMsgFromBot(element);
}

const postOpenMeetingMsg= function () {
  const element= BotOpenMeetingMsgHTML.replace('MEETING_URL_HREF', window.myState.meeting_url);
  postMsgFromBot(element);
}

const postBotFormgMsg= function () {
  const element= BotFormgMsgHTML;
  postMsgFromBot(element);

  document.getElementById("btnSubmitForm").onclick= () => {
    let form_name= document.getElementById("input_form_name").value;
    let form_surname= document.getElementById("input_form_surname").value;
    let form_mobile= document.getElementById("input_form_mobile").value;
    let form_email= document.getElementById("input_form_email").value;
    let form_afm= document.getElementById("input_form_afm").value;
    let form_klidarithmos= document.getElementById("input_form_klidarithmos").value;
    let form_details= document.getElementById("input_form_details").value;
  
    if (form_name== "" || form_surname== "" || form_mobile== "" || form_email== "" || form_afm== ""){
      postMsgFromBot("Παρακαλώ συμπληρώστε όλα τα πεδία με *");
      return;
    }
  
    document.getElementById("input_form_name").disabled= true;
    document.getElementById("input_form_surname").disabled= true;
    document.getElementById("input_form_mobile").disabled= true;
    document.getElementById("input_form_email").disabled= true;
    document.getElementById("input_form_afm").disabled= true;
    document.getElementById("input_form_klidarithmos").disabled= true;
    document.getElementById("input_form_details").disabled= true;

    postBotWaitTimegMsg();
    document.getElementById("btnSubmitForm").classList.add("myDisabledButton");
  }
}

const postBotWaitTimegMsg= async function () {
  await updateCurrentQueue();
  await updateChatboxConfiguration();
  const queue= Number(window.myState.currentQueue);
  const waitTime= queue *  window.myState.AvgMeetingDuration;
  const waitTimeMsg= `Έχετε σειρά εξυπηρέτησης ${queue+1} και ο αναμενόμενος χρόνος αναμονής σας είναι ${waitTime} λεπτά`;
  postMsgFromBot(waitTimeMsg);

  const element= BotWaitTimeMsgHTML;
  postMsgFromBot(element);

  document.getElementById("btnSendMeetingRequest").onclick= async() => {
    let form_name= document.getElementById("input_form_name").value;
    let form_surname= document.getElementById("input_form_surname").value;
    let form_mobile= document.getElementById("input_form_mobile").value;
    let form_email= document.getElementById("input_form_email").value;
    let form_afm= document.getElementById("input_form_afm").value;
    let form_klidarithmos= document.getElementById("input_form_klidarithmos").value;
    let form_details= document.getElementById("input_form_details").value;
  
    if (form_name== "" || form_surname== "" || form_mobile== "" || form_email== "" || form_afm== ""){
      postMsgFromBot("Παρακαλώ συμπληρώστε όλα τα πεδία με *");
      return;
    }

    const res= await sendMeetingRequest(form_name, form_surname, form_mobile, form_email, form_afm, form_klidarithmos, form_details);

    if (res.meeting_url){
      window.myState.meeting_url= res.meeting_url;
      postOpenMeetingMsg();
    } else{
      postBotErrorCreatingMsg();
      return;
    }
  
    document.getElementById("btnSendMeetingRequest").classList.add("myDisabledButton");
    document.getElementById("btnRantevouRequest").classList.add("myDisabledButton");
  }
}

// postBotGreetingMsg();
// postBotFormgMsg();
// postBotWaitTimegMsg();

document.getElementById("btnSend").onclick= async () => {
  const inputElement= document.getElementById("input_user");
  let input= inputElement.value;
  inputElement.value= "";

  if (input== ""){
    return;
  }

  postMsgFromUser(input);

  await updateChatboxConfiguration();
  if(!window.myState.chatBoxStart){
    postBotClosedChatboxMsg();
    return;
  }

  if(!window.myState.firstMessage){
    window.myState.firstMessage= true;
    postBotGreetingMsg();
  }
}

const BotGreetingMsgHTML= `
<div dir="ltr" class="ac-container ac-adaptiveCard" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px; margin: 0px;">
  <div class="ac-textBlock" style="overflow: hidden; font-family: Calibri,  Helvetica Neue, Arial, sans-serif; font-size: 17px; color: black; font-weight: 600; text-align: start; line-height: 22.61px; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box; flex: 0 0 auto;">
    <p style="margin-top: 0px; width: 100%; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0px;">
      Λάβαμε το μήνυμα σας, παρακαλώ επιλέξτε
    </p>
  </div>
  <div class="ac-horizontal-separator" aria-hidden="true" style="height: 8px; overflow: hidden; flex: 0 0 auto;">
  </div>
  <div>
    <div style="overflow: hidden;">
      <div class="ac-actionSet" style="display: flex; flex-direction: column; align-items: stretch;">
        <button id="btnSubmitRequest" type="button" title="Κλήση μετά απο υποβολή στοιχείων" style="color: blue; background-color: rgb(0, 99, 177); border-color: rgb(0, 99, 177); color: white; padding: 5px;">
          Κλήση μετά απο υποβολή στοιχείων
        </button>
      </div>
    </div>
    <div style="margin-top: 0px;"></div>
  </div>
</div>
`;

const BotClosedChatboxMsgHTML= `
<div dir="ltr" class="ac-container ac-adaptiveCard" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px; margin: 0px;">
  <div class="ac-textBlock" style="overflow: hidden; font-family: Calibri,  Helvetica Neue, Arial, sans-serif; font-size: 17px; color: black; font-weight: 600; text-align: start; line-height: 22.61px; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box; flex: 0 0 auto;">
    <p style="margin-top: 0px; width: 100%; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0px;">
    Η υπηρεσία Live Communication είναι απενεργοποιημένη αυτή τη στιγμή
    </p>
  </div>
  <div class="ac-horizontal-separator" aria-hidden="true" style="height: 8px; overflow: hidden; flex: 0 0 auto;">
  </div>
  <div>
    <div style="margin-top: 0px;"></div>
  </div>
</div>
`;

const BotOpenMeetingMsgHTML= `
<div dir="ltr" class="ac-container ac-adaptiveCard" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px; margin: 0px;">
  <div class="ac-textBlock" style="overflow: hidden; font-family: Calibri,  Helvetica Neue, Arial, sans-serif; font-size: 17px; color: black; font-weight: 600; text-align: start; line-height: 22.61px; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box; flex: 0 0 auto;">
    <p style="margin-top: 0px; width: 100%; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0px;">
    Παρακαλώ ακολουθήστε τον παρακάτω σύνδεσμο για έναρξη της συνάντησης
    </p>
  </div>
  <div class="ac-horizontal-separator" aria-hidden="true" style="height: 8px; overflow: hidden; flex: 0 0 auto;">
  </div>
  <a href="MEETING_URL_HREF" target="_blank"> Έναρξη συνάντησης </a>
  <div>
    <div style="margin-top: 0px;"></div>
  </div>
</div>
`;

const BotErrorCreatingMsgHTML= `
<div dir="ltr" class="ac-container ac-adaptiveCard" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px; margin: 0px;">
  <div class="ac-textBlock" style="overflow: hidden; font-family: Calibri,  Helvetica Neue, Arial, sans-serif; font-size: 17px; color: black; font-weight: 600; text-align: start; line-height: 22.61px; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box; flex: 0 0 auto;">
    <p style="margin-top: 0px; width: 100%; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0px;">
    Το αίτημα σας δεν μπορεί να εξυπηρετηθεί αυτή τη στιγμή
    </p>
  </div>
  <div class="ac-horizontal-separator" aria-hidden="true" style="height: 8px; overflow: hidden; flex: 0 0 auto;">
  </div>
  <div>
    <div style="margin-top: 0px;"></div>
  </div>
</div>
`;

const BotFormgMsgHTML= `
<div dir="ltr" class="ac-container ac-adaptiveCard" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px; margin: 0px;">
  <div class="ac-textBlock" style="overflow: hidden; font-family: Calibri,  Helvetica Neue, Arial, sans-serif; font-size: 17px; color: black; font-weight: 600; text-align: start; line-height: 22.61px; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box; flex: 0 0 auto;">
    <p style="margin-top: 0px; width: 100%; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0px;">
      Νέα υποβολή κλήσης
    </p>
  </div>
  <div class="ac-horizontal-separator" aria-hidden="true" style="height: 8px; overflow: hidden; flex: 0 0 auto;"></div>
  <div id="form_name" style="display: flex; flex-direction: column; box-sizing: border-box; flex: 0 0 auto; margin: 5px;">
      <div class="ac-input-container" style="display: flex;">
        <input id="input_form_name" class="ac-input ac-textInput" type="text" tabindex="0" placeholder="Όνομα*" aria-label="Όνομα*" style="flex: 1 1 auto;min-width: 350px;">
      </div>
  </div>
  <div id="form_surname" style="display: flex; flex-direction: column; box-sizing: border-box; flex: 0 0 auto; margin: 5px;">
    <div class="ac-input-container" style="display: flex;">
      <input id="input_form_surname" class="ac-input ac-textInput" type="text" tabindex="0" placeholder="Επώνυμο*" aria-label="Επώνυμο*" style="flex: 1 1 auto;min-width: 350px;">
    </div>
  </div>
  <div id="form_mobile" style="display: flex; flex-direction: column; box-sizing: border-box; flex: 0 0 auto; margin: 5px;">
    <div class="ac-input-container" style="display: flex;">
      <input id="input_form_mobile" class="ac-input ac-textInput" type="text" tabindex="0" placeholder="Τηλέφωνο*" aria-label="Τηλέφωνο*" style="flex: 1 1 auto;min-width: 350px;">
    </div>
  </div>
  <div id="form_email" style="display: flex; flex-direction: column; box-sizing: border-box; flex: 0 0 auto; margin: 5px;">
    <div class="ac-input-container" style="display: flex;">
      <input id="input_form_email" class="ac-input ac-textInput" type="text" tabindex="0" placeholder="Email*" aria-label="Email*" style="flex: 1 1 auto;min-width: 350px;">
    </div>
  </div>
  <div id="form_afm" style="display: flex; flex-direction: column; box-sizing: border-box; flex: 0 0 auto; margin: 5px;">
    <div class="ac-input-container" style="display: flex;">
      <input id="input_form_afm" class="ac-input ac-textInput" type="text" tabindex="0" placeholder="ΑΦΜ*" aria-label="ΑΦΜ*" style="flex: 1 1 auto;min-width: 350px;">
    </div>
  </div>
  <div id="form_klidarithmos" style="display: flex; flex-direction: column; box-sizing: border-box; flex: 0 0 auto; margin: 5px;">
    <div class="ac-input-container" style="display: flex;">
      <input id="input_form_klidarithmos" class="ac-input ac-textInput" type="text" tabindex="0" placeholder="Αρ. Αίτησης Κλειδαρίθμου	" aria-label="Αρ. Αίτησης Κλειδαρίθμου	" style="flex: 1 1 auto;min-width: 350px;">
    </div>
  </div>
  <div id="form_details" style="display: flex; flex-direction: column; box-sizing: border-box; flex: 0 0 auto; margin: 5px;">
    <div class="ac-input-container" style="display: flex;">
      <input id="input_form_details" class="ac-input ac-textInput" type="text" tabindex="0" placeholder="Λεπτομέριες" aria-label="Λεπτομέριες" style="flex: 1 1 auto;min-width: 350px;">
    </div>
  </div>
  <br>
  <div>
    <div style="overflow: hidden;">
      <div class="ac-actionSet" style="display: flex; flex-direction: column; align-items: stretch;">
        <button id="btnSubmitForm" type="button" title="Κλήση μετά απο υποβολή στοιχείων" style="color: blue; background-color: rgb(0, 99, 177); border-color: rgb(0, 99, 177); color: white; padding: 5px;">
          Υποβολή
        </button>
      </div>
    </div>
    <div style="margin-top: 0px;"></div>
  </div>
</div>
`;

const BotWaitTimeMsgHTML= `
<div dir="ltr" class="ac-container ac-adaptiveCard" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px; margin: 0px;">
  <div class="ac-textBlock" style="overflow: hidden; font-family: Calibri,  Helvetica Neue, Arial, sans-serif; font-size: 17px; color: black; font-weight: 600; text-align: start; line-height: 22.61px; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box; flex: 0 0 auto;">
    <p style="margin-top: 0px; width: 100%; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0px;">
      Παρακαλώ επιλέξτε
    </p>
  </div>
  <div class="ac-horizontal-separator" aria-hidden="true" style="height: 8px; overflow: hidden; flex: 0 0 auto;">
  </div>
  <div>
    <div style="overflow: hidden;">
      <div class="ac-actionSet" style="display: flex; flex-direction: column; align-items: stretch;">
        <button id="btnSendMeetingRequest" type="button" title="Αναμονή για κλήση τώρα" style="color: blue; background-color: rgb(0, 99, 177); border-color: rgb(0, 99, 177); color: white; padding: 5px;">
          Αναμονή για κλήση τώρα
        </button>
        <div class="ac-horizontal-separator" aria-hidden="true" style="height: 8px; overflow: hidden; flex: 0 0 auto;">
        </div>
        <button id="btnRantevouRequest" type="button" title="Κλείσιμο ραντέβου για κλήση" style="color: blue; background-color: rgb(0, 99, 177); border-color: rgb(0, 99, 177); color: white; padding: 5px;">
          Κλείσιμο ραντέβου για κλήση
        </button>
      </div>
    </div>
    <div style="margin-top: 0px;"></div>
  </div>
</div>
`;