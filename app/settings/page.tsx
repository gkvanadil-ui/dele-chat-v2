const save = async () => {
  setLoading(true);
  
  // 1. 유저 정보 가져오기
  let { data: { user } } = await supabase.auth.getUser();
  
  // 2. 유저 정보가 없으면 즉시 익명 로그인 시도
  if (!user) {
    const { data: { user: newUser } } = await supabase.auth.signInAnonymously();
    user = newUser;
  }

  if (!user) {
    alert("연결 상태가 불안정합니다. 잠시 후 다시 시도해주세요.");
    setLoading(false);
    return;
  }

  // 3. 프로필 저장
  const { error } = await supabase.from('profiles').upsert({ 
    id: user.id, 
    ...form 
  });

  if (error) alert("저장 실패: " + error.message);
  else alert("설정 완료!");
  
  setLoading(false);
};
