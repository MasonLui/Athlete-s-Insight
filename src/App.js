// Import necessary modules from Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import './App.css';
import axios from 'axios';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUAj3kJICofYNBplxbh_Umt6RS2rY_6PQ",
  authDomain: "athletes-insight.firebaseapp.com",
  projectId: "athletes-insight",
  storageBucket: "athletes-insight.appspot.com",
  messagingSenderId: "421166724984",
  appId: "1:421166724984:web:e45871f4efb9a555427a8d",
  measurementId: "G-6PE2MMTJL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [sportsNews, setSportsNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sign in with Google
  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Persist user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsArray);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  };

  // Fetch sports news from the API
  const fetchSportsNews = async (category = "all") => {
    try {
      let query = "sports";
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'us',
          category: query,
          apiKey: '222ebee407ae416eb943a1bebf425c70',
        },
      });
      let filteredArticles = response.data.articles;
      if (category !== "all") {
        filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(category) ||
        article.description?.toLowerCase().includes(category) ||
        (category === "baseball" && (article.title.toLowerCase().includes("mlb") || article.description?.toLowerCase().includes("mlb"))) ||
        (category === "football" && (article.title.toLowerCase().includes("nfl") || article.description?.toLowerCase().includes("nfl"))) ||
        (category === "basketball" && (article.title.toLowerCase().includes("nba") || article.description?.toLowerCase().includes("nba")))
      );
      }
      setSportsNews(filteredArticles);
    } catch (error) {
      console.error("Error fetching sports news: ", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSportsNews(selectedCategory);
  }, [selectedCategory]);

  // Add new post to Firestore
  const addNewPost = async () => {
    if (newPost.trim() === "") return;
    try {
      await addDoc(collection(db, "posts"), {
        content: newPost,
        author: user.displayName,
        createdAt: new Date(),
      });
      setNewPost("");
      fetchPosts();
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };

  // Delete post from Firestore
  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Athlete's Insight</h1>
          {user ? (
            <div className="user-info">
              <button className="sign-out-button" onClick={signOutUser}>Sign Out</button>
              <span>Welcome, {user.displayName}</span>
            </div>
          ) : (
            <button className="sign-in-button" onClick={signIn}>Sign In with Google</button>
          )}
        </div>
      </header>
      <nav className="tabs">
        <button className={selectedCategory === "all" ? "active" : ""} onClick={() => setSelectedCategory("all")}>Home (All News)</button>
        <button className={selectedCategory === "baseball" ? "active" : ""} onClick={() => setSelectedCategory("baseball")}>Baseball News</button>
        <button className={selectedCategory === "football" ? "active" : ""} onClick={() => setSelectedCategory("football")}>Football News</button>
        <button className={selectedCategory === "basketball" ? "active" : ""} onClick={() => setSelectedCategory("basketball")}>Basketball News</button>
      </nav>
      {user && (
        <div className="new-post">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts about the latest sports news..."
          ></textarea>
          <button className="add-post-button" onClick={addNewPost}>Add Post</button>
        </div>
      )}
      <main>
        <div className="sports-news">
          <h2>Latest {selectedCategory === "all" ? "Sports" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News</h2>
          {sportsNews.map((news, index) => (
            <div key={index} className="news-item">
              {news.urlToImage && (
                <img className="news-image" src={news.urlToImage} alt="News" style={{ width: '250px', height: '150px', objectFit: 'cover', marginRight: '15px' }} />
              )}
              <div className="news-content">
                <h3>{news.title}</h3>
                <p>{news.description}</p>
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="read-more">
                  Read more
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="posts">
          <h2>Community Posts</h2>
          {posts.map((post) => (
            <div key={post.id} className="post">
              <p>{post.content}</p>
              <span>- {post.author}</span>
              {user && user.displayName === post.author && (
                <button className="delete-post-button" onClick={() => deletePost(post.id)}>Delete Post</button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;