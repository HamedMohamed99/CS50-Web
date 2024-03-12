document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => {compose_email(); });  
  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipient = '', subject = '', body = '') {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#message').innerHTML = '';
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
}



function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  var user = document.getElementsByTagName('h2')[0].innerHTML

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
        if (mailbox != "archived") {
          for (let email of emails) {
            const emailDiv = document.createElement('div');
            if (mailbox === "inbox") { emailDiv.innerHTML = `<h5>${email.subject}</h5><div>${email.sender} - ${email.timestamp}</div>`; }
            else {emailDiv.innerHTML = `<h5>${email.subject}</h5><div>${email.recipients} - ${email.timestamp}</div>`; }
            emailDiv.className = "alert alert-secondary";
            if (!email.read) {
              emailDiv.className = "alert alert-info";
            }
            // Add a click event listener to the emailDiv
            emailDiv.addEventListener('click', () => {
              // Call your function when the div is clicked
              ViewMail(email.id, email.read); // Pass email or any relevant data to yourFunction
            });
            document.querySelector('#emails-view').appendChild(emailDiv);
          }}

        else{
          for (let email of emails) {
            if (user === email.sender) {
            const emailDiv = document.createElement('div');
            emailDiv.innerHTML = `<h5>${email.subject}</h5><div>From: ${email.sender} - To: ${email.recipients}</div><div>${email.timestamp}</div>`;
            emailDiv.className = "alert alert-secondary";
            if (!email.read) {
              emailDiv.className = "alert alert-light";
            }
            // Add a click event listener to the emailDiv
            emailDiv.addEventListener('click', () => {
              // Call your function when the div is clicked
              ViewMail(email.id, email.read); // Pass email or any relevant data to yourFunction
            });
            document.querySelector('#emails-view').appendChild(emailDiv);
          }}

          }

        // ... do something else with emails ...
    });
}


function send_email(event) {
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value; // This should already include newline characters.

  // Add '\n' to represent newlines in the email body
  const formattedBody = body.replace(/\n/g, '<br>');

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: formattedBody, // Include the formatted body with newline characters
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      document.querySelector('#message').innerHTML = result.error;
      document.querySelector('#message').style.color = 'red';
    } else {
      load_mailbox('inbox');
    }
  });
}

function ViewMail(emailid,read) {

  document.querySelector('#emails-view').innerHTML = '';
  var user = document.getElementsByTagName('h2')[0].innerHTML

  if (!read) {
  fetch(`/emails/${emailid}`,{
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

  fetch(`/emails/${emailid}`)
  .then(response => response.json())
  .then(email => {
      if (email.archived){var button = 'UnArchive'}
      else{var button = 'Archive'}
      // Print emails
      console.log(email);
      const emailDiv = document.createElement('div');
      if (email.sender != user){
      emailDiv.innerHTML = `
        <div class="d-flex justify-content-between">
          <h5>${email.subject}</h5>
          <div>
            <button id="archive" type="button" class="btn btn-info">${button}</button>
          </div>
        </div>
        <div>From: ${email.sender}</div>
        <div>To: ${email.recipients}</div>
        <div>${email.timestamp}</div>
        <br>
        <div style="margin-left: 0.5rem;">${email.body}</div>
        <br>
        <div>
        <button id="reply" type="button" class="btn btn-outline-info">Reply</button>
        </div>
        
      `;
      }

      else {
        emailDiv.innerHTML = `
        <div class="d-flex justify-content-between">
          <h5>${email.subject}</h5>
        </div>
        <div>From: ${email.sender}</div>
        <div>To: ${email.recipients}</div>
        <div>${email.timestamp}</div>
        <br>
        <div style="margin-left: 0.5rem;">${email.body}</div>
        <br>
        
      `;
      }
       
      document.querySelector('#emails-view').appendChild(emailDiv);


      if (email.sender != user){
      // Add a click event listener to the button
      document.querySelector('#archive').addEventListener('click', () => {
        fetch(`/emails/${emailid}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
        })
        .then(() => {
            // After archiving, reload the inbox mailbox
            load_mailbox('inbox');
        });
    });

    
       // Add a click event listener to the button
       document.querySelector('#reply').addEventListener('click', () => {
        let body = "On " + email.timestamp + " " + email.sender + " " + "wrote:\n" + email.body + "\n\nReply: \n"
        if (email.subject.substring(0, 4) === "Re: ") {compose_email(email.sender , email.subject, body)}
        else {
          let subject = "Re: " + email.subject
          compose_email(email.sender , subject, body)
        }
        });
      }
      
          

})
}