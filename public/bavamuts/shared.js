var currCpid = null;
var currForm = null;

const sendComment = async (comment_id, text_content, isTargetLink, isUl, commentLi) => {
    try {
        return fetch('/api/v1/comment', {
            method: 'POST',
            body: JSON.stringify({
                comment_id,
                text_content
            }),
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(response => response.json());
    } catch (error) {
        alert(`Failed replying with "${error.message}".`);
    }
}

const reply = (cpid, isTargetLink) => {
    // if open and same then remove and nothing else
    if (cpid == currCpid) {
        document.getElementById(currCpid).parentElement.removeChild(currForm);
        currCpid = null;
        currForm = null;
        return;
    };

    // if open and different then remove and then do the rest
    if (currCpid) {
        document.getElementById(currCpid).parentElement.removeChild(currForm);
        currCpid = null;
        currForm = null;
    }

    //
    let commentLi = document.getElementById(cpid).parentElement;
    let liChildren = commentLi.children;
    let numLiChildren = liChildren.length;
    let lastChild = liChildren[numLiChildren - 1];
    let isUl = lastChild.tagName == 'UL';

    //
    let cForm = document.createElement('div');
    currForm = cForm;
    let cTextarea = document.createElement('textarea');
    let cButton = document.createElement('input');
    cButton.type = 'button';
    cButton.value = 'Send';
    cButton.onclick = async function() {
        const comment = cTextarea.value.trim();

        if(comment != '') {
            const data = await sendComment(cpid, comment);

            const isError = typeof data.by === 'undefined';
            if (isError) return;
    
            const li = document.createElement('li')
    
            const space1 = document.createTextNode(' ');
            const space2 = document.createTextNode(' ');
            const space3 = document.createTextNode(' ');
    
            const bySpan0 = document.createElement('span');
            bySpan0.className = 'cby';
            bySpan0.innerHTML = 'by';
    
            const bySpan = document.createElement('span');
            bySpan.className = 'cuser';
            bySpan.innerHTML = data.by;
    
            const dateSpan = document.createElement('span');
            dateSpan.className = 'cdate';
            dateSpan.innerText = 'on ' + data.created_on;
    
            const headerElem = document.createElement('div');
            headerElem.className = 'cheader';
            headerElem.appendChild(bySpan0);
            headerElem.appendChild(document.createTextNode(' '));
            headerElem.appendChild(bySpan);
            headerElem.appendChild(space1);
            headerElem.appendChild(dateSpan);
    
            const replyLink = document.createElement('a');
            const replyLinkText = document.createTextNode('reply');
            replyLink.appendChild(replyLinkText);
            replyLink.href = "#";
            replyLink.onclick = function() {
                reply(data.public_id, isTargetLink);
                return false;
            }
    
            const permalink = document.createElement('a');
            const permalinkText = document.createTextNode('link');
            permalink.appendChild(permalinkText);
            permalink.href = "/c/" + data.public_id;
    
            const editLink = document.createElement('a');
            const editLinkText = document.createTextNode('edit');
            editLink.appendChild(editLinkText);
            editLink.href = "/c/" + data.public_id + '/edit';
    
            const footerElem = document.createElement('div');
            footerElem.className = 'clinks';
            footerElem.appendChild(permalink);
            footerElem.appendChild(space2);
    
            if(isTargetLink) {
                const targetLink = document.createElement('a');
                const targetLinkText = document.createTextNode('link#');
                targetLink.appendChild(targetLinkText);
                targetLink.href = "#" + data.public_id;
    
                footerElem.appendChild(targetLink);
                footerElem.appendChild(document.createTextNode(' '));
            }
    
            footerElem.appendChild(replyLink);
            footerElem.appendChild(space3);
            footerElem.appendChild(editLink);
    
            const contentSpan = document.createElement('span');
            contentSpan.innerHTML = data.text_content;
    
            const topContainer = document.createElement('div');
            topContainer.id = data.public_id;
    
            //
            topContainer.appendChild(headerElem);
            topContainer.appendChild(contentSpan);
            topContainer.appendChild(footerElem);
    
            li.appendChild(topContainer);
    
            //
            if(isUl) {
                //insert li as first elem of ul
                lastChild.insertBefore(li, lastChild.children[0]);
            }
            else {
                const newUl = document.createElement('ul');
                newUl.appendChild(li);
                commentLi.appendChild(newUl);
            }
    
            //
            commentLi.removeChild(cForm);
            currCpid = null;
            currForm = null;
        }
    }

    cForm.appendChild(cTextarea)
    cForm.appendChild(cButton)
    
    //
    if(isUl) {
        commentLi.insertBefore(cForm, lastChild)
    } else {
        commentLi.appendChild(cForm)
    }

    //
    currCpid = cpid
}
