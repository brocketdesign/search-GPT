let sourceInstances = {};
let isSubmitting = false;
const $buttonContainer = $('#my-form button[type="submit"')
$(document).ready(function() {
    $('#my-form').off('submit').on('submit', function(event) {
      event.preventDefault(); 
      if (isSubmitting) return;
      isSubmitting = true;
      const url = $('#url').val()
      if (!url || typeof url !== 'string' || !isValidURL(url)) {
        alert('The URL is not correct');
        return;
      }
      const formData = {url}
      handleOpenAI(formData)
      isSubmitting = false;
    });
  });
  function handleOpenAI(formData) {
    const genID = generateRandomID();

    if (shouldPreventSubmission($buttonContainer, sourceInstances)) {
        console.log('Submission is prevented due to some condition.');
        return;
    }

    console.log('Fetching response for title.');
    fetResponseOpenAi(0, genID, formData);


}

function fetResponseOpenAi(type, genID, formData) {
    console.log(`Initiating AJAX request for type: ${type}`);

    $.ajax({
        url: '/api/openai/custom/' + type,
        method: 'POST',
        data: formData,
        success: function (response) {
            console.log(`Successfully received response for type: ${type}`);
            let containerID = `card${genID}`;

            if ($('#' + containerID).length == 0) {
                console.log('Creating new card container.');
                const initialCardHtml = designCard(containerID, response);
                $('#result').prepend(initialCardHtml);
                $('#'+ containerID +' a.url').attr('href',formData.url).text(formData.url)
                handleCopyButtons();
            }

            let source = handleStream(response,
                function (message) {
                    console.log(`Appending stream message to ${type == 0 ? 'title' : 'content'}`);
                    $(`#${containerID} .${type == 0 ? 'title' : 'content'}`).append(message);
                },
                function () {
                    const final_result = convertMarkdownToHTML($(`#${containerID} .${type == 0 ? 'title' : 'content'}`).text());
                    $(`#${containerID} .${type == 0 ? 'title' : 'content'}`).html(final_result);
                    if(type<1){
                        console.log('Fetching response for content.');
                        fetResponseOpenAi(1, genID, formData);
                        return
                    }
                    resetButton($buttonContainer);

                });

            // Store the source instance for this generation
            sourceInstances[generateRandomID()] = source;
        },
        error: function (error) {
            console.error(`Error occurred for type: ${type}`, error);
            resetButton($buttonContainer);
        },
        complete: function () {
            console.log(`AJAX request completed for type: ${type}`);
            //resetButton($buttonContainer);
        }
    });
}
function handleStream(response,callback,endCallback) {
    console.log(`Start streaming on : ${response.redirect}`);

    // Establish an EventSource connection for live streaming
    const source = new EventSource(response.redirect);

    source.onopen = function(event) {
        //console.log("EventSource connection opened:", event);
    };

    source.onmessage = function(event) {
        //console.log("Raw data received:", event.data);
        
        try {
            // Assuming data contains a 'message' field. Modify as needed.
            const message = JSON.parse(event.data).content;    
            // Update the content of the card with the insertedId
            callback(message)

        } catch (e) {
            console.error("Error parsing received data:", e);
        }
    };

    source.addEventListener('end', function(event) {

        const data = JSON.parse(event.data);

        if (endCallback) endCallback(data);

        console.log("Stream has ended:", {data});

        source.close();
    });

    source.onerror = function(error) {
        console.log("EventSource failed:", error);
        if (endCallback) endCallback();
        source.close();
    };

    return source;
}
function resetButton($buttonContainer){
    $('#loader').hide()
    $buttonContainer
    .removeClass('btn-danger stop')
    .addClass('btn-primary')
    .html('<span>Generate</span>')
}
function shouldPreventSubmission($buttonContainer,sourceInstances) {
    if ($buttonContainer.hasClass('stop')) {
        if(!isEmpty(sourceInstances)){
            stopStreams(sourceInstances)
        }
        resetButton($buttonContainer)
        return true;
    }
    
    $('#loader').toggle()
    $('#my-form button[type="submit"')
    .toggleClass('btn-primary btn-danger stop')
    .html('<span>Stop</span>')
    return false;
}
function stopStreams(sources) {
    if (sources instanceof EventSource) {
        // It's a single stream.
        sources.close();
        console.log("Single stream has been stopped.");
    } else if (typeof sources === 'object' && sources !== null) {
        // It's an object containing multiple streams.
        for (let key in sources) {
            if (sources[key] instanceof EventSource) {
                sources[key].close();
                console.log(`Stream ${key} has been stopped.`);
            }
        }
    } else {
        console.error("Invalid input provided to stopStreams.");
    }
}

function isValidURL(string) {
  try {
      new URL(string);
      return true;
  } catch (_) {
      return false;
  }
}

function generateRandomID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    
    return result;
}
function isEmpty(obj) {
    return JSON.stringify(obj) === '{}';
}
function designCard(containerID,doc){
    return `<div class="card bg-white shadow border mb-3" id="${containerID}" data-id="${doc.insertedId}">
    <div class="card-top p-3 d-flex align-items-center justify-content-between">
    <div class="tools d-flex align-items-center">
    <a class="btn btn-white tool-button share mx-2" onclick="handleShareButton(this)" data-toggle="tooltip" title="Twitterでシェア"><i class="fas fa-share-alt"></i></a>
    <badge class="btn btn-white tool-button tool-button-copy mx-2" data-toggle="tooltip" title="コピー"><i class="fas fa-copy"></i></badge>
    <badge class="btn btn-white tool-button tool-button-post mx-2" data-toggle="tooltip" title="Post"><i class="fas fa-plane"></i></badge>
    </div><div class="text-end text-sm text-muted" style="font-size:12px"><div class="custom-date" data-value="${new Date()}"></div></div></div><div class="card-body">
    <h2 class="title"></h2>
    <div class="content"></div>
    <a class="url" href="#" target='_blank'>
    </div></div>`;
}
function handleShareButton(e) {
    const tweetText = $(e).closest('.card').find(`.card-body p`).text();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url`)
}
function handleCopyButtons() {
    $(document).on('click', '.tool-button-copy', function() {
      let content = $(this).closest('.card').find(".card-body p").text().trim();
      console.log({content})
      let tempTextArea = $("<textarea></textarea>");
      $("body").append(tempTextArea);
      tempTextArea.val(content);
      tempTextArea.select();
      document.execCommand("copy");
      tempTextArea.remove();
  
      // Update the tooltip title to "コピーしました" and show it
      $(this).attr('title', 'コピーしました').tooltip('_fixTitle').tooltip('show');
  
      // After 2 seconds, revert the tooltip title to "コピー"
      setTimeout(() => {
        $(this).attr('title', 'コピー').tooltip('_fixTitle');
      }, 2000);
    });
}
function handlePostButtons() {
    $(document).on('click', '.tool-button-post', function() {
      let content = $(this).closest('.card').find(".card-body p").text().trim();
      let title = $(this).closest('.card').find(".card-title").text().trim() || 'test'; // Assuming you have a card-title class for the title
      console.log('Post content: ',{content, title})
      // Make AJAX call to post the article
      $.ajax({
        url: '/api/postArticle',  // Replace with your actual API endpoint
        method: 'POST',
        dataType: 'json',
        data: {
          title: title,
          content: content
        },
        success: function(response) {
          // Handle success
          if (response.status === 'success') {
            handleFormResult(true,'記事が正常に投稿されました')
            // Update the tooltip title to "記事が正常に投稿されました" and show it
            $(this).attr('title', '記事が正常に投稿されました').tooltip('_fixTitle').tooltip('show');
          } else {
            handleFormResult(false,'記事の投稿に失敗しました')
            // Handle the error based on the response message
            $(this).attr('title', '記事の投稿に失敗しました').tooltip('_fixTitle').tooltip('show');
          }
        }.bind(this), // Make sure 'this' context is the clicked button in the success function
        error: function() {
            handleFormResult(false,'内部エラーが発生しました')
          // Handle failure
          $(this).attr('title', '内部エラーが発生しました').tooltip('_fixTitle').tooltip('show');
        }.bind(this) // Make sure 'this' context is the clicked button in the error function
      });
  
      // After 2 seconds, revert the tooltip title to "記事投稿"
      setTimeout(() => {
        $(this).attr('title', '記事投稿').tooltip('_fixTitle');
      }, 2000);
    });
  }


    
  function convertMarkdownToHTML(markdownContent) {
    const converter = new showdown.Converter();
      return converter.makeHtml(markdownContent);
  }