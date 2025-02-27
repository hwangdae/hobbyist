import React from "react";
import { styled } from "styled-components";
import { useState } from "react";
import { useEffect } from "react";
import github from "../img/github.png";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../service/firebase";

// 모달 디자인//

const BcDiv = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  width: 100%;
  height: 100%;
  display: ${(props) => (props.open ? "block" : "none")};
`;

const StDiv = styled.div`
  width: 550px;
  height: 400px;
  z-index: 9999;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
`;

const Stbtn = styled.button`
  position: absolute;
  background-color: transparent;
  border-style: none;
  right: 10px;
  top: 10px;
  font-size: 17px;
  cursor: pointer;
`;

const StForm = styled.form`
  text-align: center;
`;

const StH2 = styled.h2`
  color: #5e5ee8;
  font-size: 28px;
  padding-top: 20px;
`;

const StNameInput = styled.input`
  width: 400px;
  height: 40px;
  background-color: #f5f3f3;
  border-style: none;
  border-radius: 8px;
  padding-left: 15px;
`;

const StMemoInput = styled.input`
  width: 400px;
  height: 120px;
  background-color: #f5f3f3;
  border-style: none;
  border-radius: 8px;
  padding-left: 15px;
`;

const StLoginBtn = styled.button`
  width: 100px;
  height: 30px;
  border-radius: 5px;
  border-style: none;
  background-color: #6969ed;
  cursor: pointer;
  color: white;
  margin-bottom: 10px;
`;

// 모달 디자인 //

const ProfileContainer = styled.div`
  background-color: white;
  width: 500px;
  height: 600px;

  border-radius: 20px;

  display: flex;
  align-items: center;
  flex-direction: column;

  box-shadow: 0px 1px 5px gray;
`;

const MyDiv = styled.div`
  background-color: gray;
  border-radius: 70%;
  width: 250px;
  height: 250px;
  overflow: hidden;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const NameContainer = styled.div`
  padding-left: 10px;
  margin-bottom: 40px;
`;

const MyName = styled.span`
  font-size: 30px;
  font-weight: bold;
  margin-right: 10px;
`;

const IntroduceMe = styled.div`
  background-color: #f5f5f5;
  width: 80%;
  height: 180px;
  padding: 10px;

  display: flex;
  flex-direction: row;
`;

const EditBtn = styled.button`
  background-image: url("https://img.icons8.com/?size=1x&id=47749&format=png");
  background-size: cover;
  border: none;
  background-color: transparent;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  margin-left: auto;
  cursor: pointer;
`;

const IntroduceMent = styled.p`
  font-size: 20px;
`;

const ProfileEditBtn = styled.button`
  display: ${(props) =>
    props.currentUserId === props.params ? "block" : "none"};
`;
function Profile() {
  const [users, setUsers] = useState([]);
  const [memo, setMemo] = useState("");
  const [open, setOpen] = useState(false);
  const [image] = useState(github);
  const [editedName, setEditedName] = useState("");
  const [editedMemo, setEditedMemo] = useState("");

  // 현재 유저 아이디 가져옴
  const params = useParams().id;
  console.log(params);

  // DB에서 저장된 값 불러오는 부분과 재렌더링
  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);

      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      // 유저의 정보를 받아와서 닉네임 및 메모 자동 설정
      const thisUser = fetchedUsers.find(
        (user) => params === user.uid
      ).nickname;
      setUsers(thisUser);
      const thisMemo = fetchedUsers.find((user) => params === user.uid).memo;
      setMemo(thisMemo);
      console.log(thisMemo);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // 수정

  const handleProfileEdit = async (params) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("uid", "==", params))
      );
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          nickname: editedName,
          memo: editedMemo,
        });
      });
      setEditedName("");
      setEditedMemo("");
      fetchUsers();
      setOpen(!open);
    } catch (error) {
      console.error("프로필 수정 오류:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const profileModalHandler = () => {
    setOpen(!open);
  };

  const currentUserId = auth.currentUser.uid;
  console.log(currentUserId);

  return (
    <>
      <ProfileContainer>
        <MyDiv>
          <img src={image} style={{ width: "250px" }} />
        </MyDiv>
        <ProfileEditBtn
          currentUserId={currentUserId}
          params={params}
          onClick={profileModalHandler}
        >
          수정
        </ProfileEditBtn>
        <NameContainer>
          <MyName>{users}</MyName>
          <EditBtn
            width="30px"
            height="30px"
            onClick={profileModalHandler}
          ></EditBtn>
        </NameContainer>
        <IntroduceMe>
          <IntroduceMent>{memo}</IntroduceMent>
          <EditBtn width="30px" height="30px"></EditBtn>
        </IntroduceMe>
      </ProfileContainer>
      <div>
        <BcDiv open={open} onClick={profileModalHandler}>
          <StDiv onClick={(e) => e.stopPropagation()}>
            <StForm>
              <StH2>Profile</StH2>
              <p>
                <StNameInput
                  type="text"
                  value={editedName}
                  placeholder="변경할 닉네임을 입력하세요."
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </p>
              <p>
                <StMemoInput
                  type="text"
                  value={editedMemo}
                  placeholder="자기소개를 입력하세요."
                  onChange={(e) => setEditedMemo(e.target.value)}
                />
              </p>
              {/* <Profile setDownloadURL={setDownloadURL} /> */}
              <StLoginBtn
                onClick={(event) => {
                  event.preventDefault(); // 기본 동작인 새로고침을 막음
                  handleProfileEdit(params);
                }}
              >
                수정완료
              </StLoginBtn>
              <br />
            </StForm>

            <Stbtn onClick={profileModalHandler}>x</Stbtn>
          </StDiv>
        </BcDiv>
      </div>
    </>
  );
}

export default Profile;
