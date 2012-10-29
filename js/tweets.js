if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g,'');
	};
}


window.Twitter = {
	
	tweets: [],

	params: {
		users: [],
		user_query: '',
		loaded_tweets: [],
		play_animation_every: 5, // in seconds
		max_num_of_tweets: 20,
		check_for_tweets_every: 60, // in seconds
		tweets_loaded: false,
		requests_sent: 0, // number of requests sent for each user
		responses_recieved: 0 // number of requests sent for each user
	},


	init: function() {
		Twitter.extractUser();
		Twitter.checkForTwitter();
	},


	// extracts twitter screen names from the DOM
	extractUser: function() {
		var users = $('#tweets').data('user'),
				usr = '';

		users = users.split(',');

		// Error
		if( users.length === 0 ) {
			return;
		}

		// in case array only
		if( users.length > 1 ) {

			// loops throughall the users, trims all of them and pushes them into array
			for( var i = 0; i < users.length; i += 1 ) {
				usr = users[i].trim();
				if( usr ) {
					Twitter.params.users.push( usr );
					
				}
			}
			
		} else {
			Twitter.params.users = users[0].trim();
		}

		return Twitter.params.users;
	},


	checkForTwitter: function() {
		if( !Twitter.params.users ) {
			return;
		}

		Twitter.getTwitter();
		// setTimeout('Twitter.checkForTwitter()', Twitter.params.check_for_tweets_every * 1000 );
	},


	// sends an ajax request for tweets for all the users in the array.
	getTwitter: function() {
		Twitter.params.user_query = Twitter.prepareUsersQuery();
		Twitter.requestForTweets();
	},

	// Creates a string for user query: from:sreen_name+OR+from:another_screen_name - url encoded
	prepareUsersQuery: function() {

		var users = [];
		
		for( var i = 0; i < Twitter.params.users.length; i += 1 ) {
			users.push('from%3a' + Twitter.params.users[i].replace('@', '') );
		}

		return users.join('+OR+');

	},


	requestForTweets: function() {

		$.ajax({
			url: 'http://search.twitter.com/search.json',
			type: 'GET',
			dataType: 'jsonp',

			data: { // for more params see: https://dev.twitter.com/docs/api/1/get/search
				q: Twitter.params.user_query,
				rpp: Twitter.params.max_num_of_tweets
				// result_type: 'recent'
			},

			success: Twitter.loadTweets
		});

	},


	loadTweets: function( tweets ) {
		Twitter.tweets = tweets.results;

		for( var i = 0; i < Twitter.tweets.length; i += 1 ) {
			Twitter.displayTweet( Twitter.tweets[i] );
		}

		Twitter.nextTweet();
	},


	nextTweet: function() {
		var last_tweet = $('#tweets li').last();
		var height = last_tweet.height();
		$('#tweets li').last().remove();
		Twitter.insertNewItem( last_tweet.html(), height );
		setTimeout('Twitter.nextTweet();', Twitter.params.play_animation_every * 1000 );
	},

	insertNewItem: function( item_html, height ) {
		$('#tweets').prepend('<li class="spacer">' + item_html + '</li>');
		$('#tweets .spacer').css({height:0}).animate({height: height}, 500, function() {
			$(this).removeClass('spacer').html(item_html);
		});
	},

	displayTweet: function( tweet ) {
		Twitter.params.loaded_tweets.push( tweet );
		console.log('Displaying: ', tweet );
		var tweet_text = Twitter.linkify( tweet.text );
		$('#tweets').append('<li class="tweet"><span class="thumb"><img src="' + tweet.profile_image_url +'"></span>' + tweet_text + '</li>');
	},


	linkify: function ( text ) {
		text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
			return '<a href="' + s + '" target="_blank" >' + s + '</a>';
		});

		text = text.replace(/(^|)@(\w+)/gi, function (s) {
			return '<a href="http://twitter.com/' + s + '" target="_blank" >' + s + '</a>';
		});

		text = text.replace(/(^|)#(\w+)/gi, function (s) {
			return '<a href="http://search.twitter.com/search?q=' + s.replace(/#/,'%23') + '" target="_blank">' + s + '</a>';
		});

		return text;
	}

};


$(Twitter.init);