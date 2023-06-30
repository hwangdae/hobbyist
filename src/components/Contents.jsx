import React, { useEffect, useState, useRef } from "react";
import { styled } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faHeart,
  faCommentDots,
  faShareFromSquare,
} from "@fortawesome/free-regular-svg-icons";
import {
  Firestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../service/firebase";
import { useNavigate } from "react-router-dom";

const Main = styled.main`
  padding: 20px;
  background: #eee;
  width: 600px;
  margin-top: 150px;
  margin-left: 100px;
`;
const MainInner = styled.div`
  margin-bottom: 20px;
`;
const MainUser = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 0px;
  cursor: pointer;
`;

const UserImg = styled.img`
  width: 48px;
`;

const User = styled.h3`
  font-size: 25px;
  font-weight: 600;
  letter-spacing: -1px;
`;
const ContentsBox = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
`;

const FunctionUl = styled.ul`
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  margin: 20px 15px;
  list-style: none;
`;

const IconSpan = styled.span`
  margin-right: 6px;
  font-size: 17px;
  cursor: pointer;
`;

const CommentForm = styled.form`
  position: relative;
  right: 0;
  top: 0;
`;

const CommentInput = styled.input`
  width: 100%;
  padding: 9px 8px;
  border-radius: 5px;
  border: none;
  outline: none;
  box-sizing: border-box;
  background: #eee;
`;

const CommentButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 0px 5px 5px 0px;
  background: #222;
  color: #fff;
`;

const TextArea = styled.textarea`
  position: absolute;
  width: 0px;
  height: 0px;
  bottom: 0;
  right: 0;
  opacity: 0;
`;


function Contents() {
  const [likeCount, setLikeCount] = useState(false);
  const [, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  //현재 로그인 된 아이디 알아오는 함수
  const getCurrentUserUid = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    console.log("현재 로그인 된 아이디", currentUser);
    if (currentUser) {
      return currentUser.uid;
    } else {
      console.log("로그인된 사용자가 없습니다!");
      return null;
    }
  };
  //
  const getNickname = async (uid) => {
    console.log(uid);
  const [, setUsers] = useState();

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData.nickname;
      } else {
        throw new Error("User not found");
      }

      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(fetchedUsers);
      console.log(fetchedUsers);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // DB에서 저장된 값 불러오는 부분과 재렌더링
  const fetchComments = async () => {
    try {
      const q = query(collection(db, "Comments"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedComments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
    
  useEffect(() => {
    fetchComments();
  }, []);
    
  //Like 함수 부분 빼놨습니다!
  const handleLike = async () => {
    try {
      const snapshot = await Firestore.collection("").doc("").get();
      let currentCount = 0;
      if (snapshot.exists) {
        const data = snapshot.data();
        currentCount = data.likeCount || 0;
      }
      await Firestore.collection("")
        .doc("")
        .update({
          likeCount: currentCount + 1,
        });
      setLikeCount(currentCount + 1);
    } catch (error) {
      console.error("Error updating like count:", error);
    }
  };

  //입력시 DB에 저장하는 함수
  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    // 닉네임 가져오기
    const uid = getCurrentUserUid();
    if (!uid) {
      console.error("User UID not found");
      return;
    }
    try {
      const fetchedNickname = await getNickname(uid);
      const newComment = {
        CID: uuid(),
        comment: comment,
        createdAt: new Date(),
        nickname: fetchedNickname,
      };
      await addDoc(collection(db, "Comments"), newComment);
      setComment(""); // 댓글 작성 후 입력 필드 비우기
      fetchComments(); // 댓글 목록 다시 불러오기
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };
  //DB에서 해당하는 CID값을 가진 댓글을 수정하는 함수
  const handleCommentEdit = async (CID) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "Comments"), where("CID", "==", CID))
      );
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          comment: editedComment,
        });
      });
      setEditCommentId("");
      setEditedComment("");
      fetchComments();
    } catch (error) {
      console.error("댓글 수정 오류:", error);
    }
  };
  //DB에서 해당하는 CID값을 가진 댓글을 삭제하는 함수
  const handleCommentDelete = async (CID) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "Comments"), where("CID", "==", CID))
      );
      const deletecomment = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletecomment);
      fetchComments();
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
    }
  };

  // DB에서 저장된 포스트를 불러오는 함수
  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  // 포스트 저장 부분 불러옴
  useEffect(() => {
    fetchPosts();
  }, []);

  //DB에서 해당하는 CID값을 가진 댓글을 삭제하는 함수
  const PostDeleteBtn = async (CID) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "posts"), where("CID", "==", CID))
      );
      const deletePost = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePost);
      fetchPosts();
    } catch (error) {
      console.error("포스트 삭제 오류:", error);
    }
  };

  // 공유하기 기능
  const copyUrlRef = useRef(null);

  const copyUrl = (postId) => {
    if (!document.queryCommandSupported("copy")) {
      return alert("복사 기능이 지원되지 않는 브라우저입니다.");
    }
    const currentUrl = window.location.href; // 현재 페이지 URL 가져오기
    const additionalPath = `detail/${postId}`; // 추가할 경로

    const newUrl = currentUrl + additionalPath; // 현재 URL에 추가 경로를 붙임
    copyUrlRef.current.value = newUrl; // 복사할 URL을 참조하는 input 요소에 새로운 URL 설정

    copyUrlRef.current.select();
    document.execCommand("copy");

    alert("링크가 복사되었습니다.");
  };
  const navigate = useNavigate();

  return (
    <>
      <div style={{ width: "650px" }}>
        {posts.map((post) => {
          return (
            <Main key={post.CID}>
              <MainInner>
                <MainUser
                  onClick={() => {
                    navigate(`/mypage/${post.uid}`);
                  }}
                >
                  <UserImg src="images/user_img.png" alt="" />
                  <User>{post.nickname}</User>
                </MainUser>
                <ContentsBox
                  onClick={() => {
                    navigate(`/detail/${post.id}`);
                  }}
                >
                  <h2>{post.title}</h2>
                  <img
                    style={{
                      width: "100%",
                    }}
                    src={post.downloadURL}
                    alt=""
                  />
                  <span>{post.body}</span>
                </ContentsBox>

                <FunctionUl>
                  <li>
                    <IconSpan>
                      <FontAwesomeIcon icon={faHeart} onClick={handleLike} />
                    </IconSpan>
                    {likeCount}
                  </li>
                  <li>
                    <IconSpan>
                      <FontAwesomeIcon icon={faCommentDots} />
                    </IconSpan>
                    댓글작성
                  </li>
                  <li>
                    <IconSpan>
                      <FontAwesomeIcon icon={faBookmark} />
                    </IconSpan>
                    북마크
                  </li>
                  <li>
                    <TextArea
                      ref={copyUrlRef}
                      value={window.location.href}
                    ></TextArea>
                    <IconSpan onClick={() => copyUrl(post.id)}>
                      <FontAwesomeIcon icon={faShareFromSquare} />
                    </IconSpan>
                    공유하기
                  </li>
                </FunctionUl>
              </MainInner>
            </Main>
          );
        })}
      </div>
    </>
  );
}
export default Contents;
