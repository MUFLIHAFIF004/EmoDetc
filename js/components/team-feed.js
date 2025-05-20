/**
 * Team Feed Component
 * Parte da camada de saída (Output Layer) na arquitetura de 3 camadas
 */

const TeamFeedComponent = {
    container: null,
    selectedMood: 'neutral', // Default mood
    
    init: function(container) {
        this.container = container;
        this.selectedMood = appState.user.currentMood || 'neutral';
        this.setupEventListeners();
        this.highlightSelectedMood();
    },
    
    setupEventListeners: function() {
        // Setup mood selectors
        const moodSelectors = document.querySelectorAll('.mood-selector');
        moodSelectors.forEach(selector => {
            selector.addEventListener('click', () => {
                const mood = selector.getAttribute('data-mood');
                this.selectedMood = mood;
                this.highlightSelectedMood();
                
                // Update app state
                appState.user.currentMood = mood;
            });
        });
        
        // Setup post form
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createPost();
            });
        }
        
        // Setup filter button
        const applyFilterBtn = document.getElementById('apply-filter-btn');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        // Setup sort selector
        const sortPosts = document.getElementById('sort-posts');
        if (sortPosts) {
            sortPosts.addEventListener('change', () => {
                this.sortPosts(sortPosts.value);
            });
        }
        
        // Setup like buttons
        const likeButtons = document.querySelectorAll('.like-btn');
        likeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.toggleLike(button);
            });
        });
        
        // Setup comment buttons
        const commentButtons = document.querySelectorAll('.comment-btn');
        commentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.showCommentForm(button);
            });
        });
        
        // Setup share buttons
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.sharePost(button);
            });
        });
    },
    
    highlightSelectedMood: function() {
        // Remove highlight from all selectors
        const moodSelectors = document.querySelectorAll('.mood-selector');
        const moodOptions = document.querySelectorAll('.mood-option');
        
        moodSelectors.forEach(selector => {
            selector.classList.remove('ring-2', 'ring-indigo-500');
            selector.classList.remove('scale-110');
        });
        
        moodOptions.forEach(option => {
            option.classList.remove('font-bold');
        });
        
        // Add highlight to selected selector
        const selectedSelector = document.querySelector(`.mood-selector[data-mood="${this.selectedMood}"]`);
        if (selectedSelector) {
            selectedSelector.classList.add('ring-2', 'ring-indigo-500');
            selectedSelector.classList.add('scale-110');
            
            // Also highlight the parent mood option
            const parentOption = selectedSelector.closest('.mood-option');
            if (parentOption) {
                parentOption.classList.add('font-bold');
            }
        }
    },
    
    createPost: function() {
        const titleInput = document.getElementById('post-title');
        const contentInput = document.getElementById('post-content');
        const tagsInput = document.getElementById('post-tags');
        
        if (!titleInput || !contentInput || !tagsInput) return;
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const tags = tagsInput.value.trim();
        
        if (title === '' || content === '') {
            alert('Judul dan konten refleksi harus diisi.');
            return;
        }
        
        // Create new post
        const feedPosts = document.getElementById('feed-posts');
        if (!feedPosts) return;
        
        // Format tags
        const tagsList = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        let tagsHTML = '';
        
        tagsList.forEach(tag => {
            tagsHTML += `<span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">${tag}</span>`;
        });
        
        // Get current date and time
        const now = new Date();
        const dateTimeStr = now.toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }) + ', ' + now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Create post HTML
        const postHTML = `
            <div class="p-4 post-item" data-mood="${this.selectedMood}" data-author="${appState.user.id}" data-tags="${tagsList.join(',')}">
                <div class="flex items-start mb-2">
                    <div class="mood-indicator bg-${this.getMoodColor(this.selectedMood)} mt-1 mr-3"></div>
                    <div class="flex-grow">
                        <h3 class="font-bold text-lg">${title}</h3>
                        <div class="flex items-center text-sm text-gray-500 mb-2">
                            <span class="font-medium mr-2">${appState.user.name}</span>
                            <span>${dateTimeStr}</span>
                        </div>
                        <p class="text-gray-700 mb-3">
                            ${content}
                        </p>
                        <div class="flex flex-wrap gap-2 mb-3">
                            ${tagsHTML}
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <button class="like-btn flex items-center text-gray-500 hover:text-indigo-600">
                                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                                    </svg>
                                    <span>0</span>
                                </button>
                                <button class="comment-btn flex items-center text-gray-500 hover:text-indigo-600">
                                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <span>0</span>
                                </button>
                            </div>
                            <button class="share-btn flex items-center text-gray-500 hover:text-indigo-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add new post at the beginning
        feedPosts.insertAdjacentHTML('afterbegin', postHTML);
        
        // Clear form
        titleInput.value = '';
        contentInput.value = '';
        tagsInput.value = '';
        
        // Setup event listeners for new buttons
        const newLikeBtn = feedPosts.querySelector('.post-item:first-child .like-btn');
        const newCommentBtn = feedPosts.querySelector('.post-item:first-child .comment-btn');
        const newShareBtn = feedPosts.querySelector('.post-item:first-child .share-btn');
        
        newLikeBtn.addEventListener('click', () => {
            this.toggleLike(newLikeBtn);
        });
        
        newCommentBtn.addEventListener('click', () => {
            this.showCommentForm(newCommentBtn);
        });
        
        newShareBtn.addEventListener('click', () => {
            this.sharePost(newShareBtn);
        });
        
        // Show success message
        alert('Refleksi berhasil dibagikan!');
    },
    
    getMoodColor: function(mood) {
        switch(mood) {
            case 'happy': return 'green-500';
            case 'neutral': return 'yellow-500';
            case 'angry': return 'red-500';
            case 'sad': return 'blue-500';
            default: return 'gray-500';
        }
    },
    
    applyFilters: function() {
        const filterMood = document.getElementById('filter-mood').value;
        const filterAuthor = document.getElementById('filter-author').value;
        const filterTag = document.getElementById('filter-tag').value;
        
        const posts = document.querySelectorAll('.post-item');
        
        posts.forEach(post => {
            const postMood = post.getAttribute('data-mood');
            const postAuthor = post.getAttribute('data-author');
            const postTags = post.getAttribute('data-tags');
            
            let showPost = true;
            
            // Apply mood filter
            if (filterMood !== 'all' && postMood !== filterMood) {
                showPost = false;
            }
            
            // Apply author filter
            if (filterAuthor !== 'all' && postAuthor !== filterAuthor) {
                showPost = false;
            }
            
            // Apply tag filter
            if (filterTag !== 'all' && (!postTags || !postTags.includes(filterTag))) {
                showPost = false;
            }
            
            // Show or hide post
            post.style.display = showPost ? 'block' : 'none';
        });
    },
    
    sortPosts: function(sortValue) {
        const feedPosts = document.getElementById('feed-posts');
        const posts = Array.from(document.querySelectorAll('.post-item'));
        
        switch(sortValue) {
            case 'oldest':
                // Reverse the order (newest is default)
                posts.reverse();
                break;
            case 'popular':
                // Sort by number of likes
                posts.sort((a, b) => {
                    const aLikes = parseInt(a.querySelector('.like-btn span').textContent);
                    const bLikes = parseInt(b.querySelector('.like-btn span').textContent);
                    return bLikes - aLikes;
                });
                break;
            default: // newest
                // Already in newest order, no need to sort
                return;
        }
        
        // Remove all posts
        posts.forEach(post => post.remove());
        
        // Add sorted posts
        posts.forEach(post => {
            feedPosts.appendChild(post);
        });
    },
    
    toggleLike: function(button) {
        const likeCount = button.querySelector('span');
        const currentLikes = parseInt(likeCount.textContent);
        
        if (button.classList.contains('liked')) {
            // Unlike
            likeCount.textContent = currentLikes - 1;
            button.classList.remove('liked');
            button.classList.remove('text-indigo-600');
            button.classList.add('text-gray-500');
        } else {
            // Like
            likeCount.textContent = currentLikes + 1;
            button.classList.add('liked');
            button.classList.remove('text-gray-500');
            button.classList.add('text-indigo-600');
        }
    },
    
    showCommentForm: function(button) {
        const post = button.closest('.post-item');
        
        // Check if comment form already exists
        if (post.querySelector('.comment-form')) {
            post.querySelector('.comment-form').remove();
            return;
        }
        
        // Create comment form
        const commentForm = document.createElement('div');
        commentForm.className = 'comment-form mt-4 p-3 bg-gray-50 rounded-lg';
        commentForm.innerHTML = `
            <textarea class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tulis komentar Anda..." rows="2"></textarea>
            <div class="flex justify-end mt-2">
                <button class="bg-indigo-600 text-white py-1 px-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm">Kirim Komentar</button>
            </div>
        `;
        
        // Add comment form to post
        const postContent = post.querySelector('.flex-grow');
        postContent.appendChild(commentForm);
        
        // Focus on textarea
        commentForm.querySelector('textarea').focus();
        
        // Setup submit button
        const submitBtn = commentForm.querySelector('button');
        submitBtn.addEventListener('click', () => {
            const commentText = commentForm.querySelector('textarea').value.trim();
            
            if (commentText === '') {
                alert('Komentar tidak boleh kosong.');
                return;
            }
            
            // Add comment
            this.addComment(post, commentText);
            
            // Remove comment form
            commentForm.remove();
        });
    },
    
    addComment: function(post, commentText) {
        // Increment comment count
        const commentBtn = post.querySelector('.comment-btn');
        const commentCount = commentBtn.querySelector('span');
        const currentComments = parseInt(commentCount.textContent);
        commentCount.textContent = currentComments + 1;
        
        // Create comment element
        const comment = document.createElement('div');
        comment.className = 'comment mt-3 p-3 bg-gray-50 rounded-lg';
        comment.innerHTML = `
            <div class="flex items-center text-sm text-gray-500 mb-1">
                <span class="font-medium mr-2">${appState.user.name}</span>
                <span>Baru saja</span>
            </div>
            <p class="text-gray-700">${commentText}</p>
        `;
        
        // Add comment to post
        const postContent = post.querySelector('.flex-grow');
        
        // Check if comments container exists
        let commentsContainer = post.querySelector('.comments-container');
        if (!commentsContainer) {
            commentsContainer = document.createElement('div');
            commentsContainer.className = 'comments-container mt-4';
            postContent.appendChild(commentsContainer);
        }
        
        commentsContainer.appendChild(comment);
    },
    
    sharePost: function(button) {
        // In a real application, this would open a share dialog
        alert('Fitur berbagi refleksi akan membuka dialog berbagi. Fitur ini belum diimplementasikan sepenuhnya.');
    }
};
