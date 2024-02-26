const dummy = blogs => {
  return 1
}

const totalLikes = listOfBlogs => {
  return listOfBlogs.length === 0
    ? 0
    : listOfBlogs
        .reduce((sum, item) => {
          return sum + item.likes
        }, 0)
}

const favoriteBlog = blogs => {

  const favorite = {
    title: '',
    author: '',
    likes: -1
  }

  for (let blog of blogs) {
    if (blog.likes > favorite.likes){
      favorite.title = blog.title
      favorite.author = blog.author
      favorite.likes = blog.likes
    }
  }

  return favorite;

}

const mostBlogs = arrayOfBlogs => {

  let authors = {}, winner = { author: '', blogs: 0 }

  for (let blog of arrayOfBlogs) {
    if (authors[blog.author]) {
      authors[blog.author] += 1
    } else {
      authors[blog.author] = 1
    }
  }

  for (let author in authors) {
    if (authors[author] > winner.blogs) {
      winner.author = author
      winner.blogs = authors[author]
    }
  }

  return winner
}

const mostLikes = arrayOfBlogs => {

  let authors = {}, winner = { author: '', likes: 0 }

  for (let blog of arrayOfBlogs) {
    
    if(authors[blog.author]) {
      authors[blog.author] += blog.likes 
    } else {
      authors[blog.author] = blog.likes
    }
  }

  for (let author in authors) {
    if(authors[author] > winner.likes) {
      winner.author = author
      winner.likes = authors[author]
    }
  }
  
  return winner
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}