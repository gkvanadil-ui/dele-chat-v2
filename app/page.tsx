const save = async () => {
  setLoading(true);
  // 세션을 다시 한 번 직접 가져옴
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // 만약 유저가 없다면 한 번 더 로그인을 시도해봄
    const { data: { user: retryUser } } = await supabase.auth.signInAnonymously();
    if (!retryUser) {
      alert("로그인 세션을 생성할 수 없습니다. 인터넷 연결을 확인해주세요.");
      setLoading(false);
      return;
    }
  }

  const finalUser = user || (await supabase.auth.getUser()).data.user;

  const { error } = await supabase.from('profiles').upsert({ 
    id: finalUser?.id, 
    ...form 
  });

  if (error) alert("저장 실패: " + error.message);
  else alert("설정 완료!");
  setLoading(false);
};
