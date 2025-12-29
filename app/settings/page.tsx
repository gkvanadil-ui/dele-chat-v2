const save = async () => {
  setLoading(true);
  
  // 1. 현재 유저 확인
  let { data: { user } } = await supabase.auth.getUser();
  
  // 2. 만약 유저가 없다면 (세션 딜레이 등) 즉석에서 익명 로그인 시도
  if (!user) {
    const { data: { user: newUser }, error: loginError } = await supabase.auth.signInAnonymously();
    if (loginError || !newUser) {
      alert("연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    user = newUser;
  }

  // 3. 저장 시도
  const { error } = await supabase.from('profiles').upsert({ 
    id: user.id, // 익명 유저의 고유 ID
    ...form 
  });

  if (error) alert("저장 실패: " + error.message);
  else alert("설정 완료!");
  
  setLoading(false);
};
