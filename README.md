# 🏃‍♂️ 무궁화 꽃이 피었습니다 - 등수 추첨 웹서비스

React + TypeScript로 개발된 무궁화 꽃이 피었습니다 게임을 모티브로 한 등수 추첨 웹서비스입니다.
mugunghwarun.netlify.app

## 🎯 프로젝트 개요

사용자가 지인들끼리 등수를 랜덤으로 얻고 싶을 때 사용하는 웹 서비스입니다. 
참가자들이 출발선에서 시작하여 "무궁화 꽃이 피었습니다"가 외쳐지는 동안 랜덤으로 전진하고, 
술래가 뒤를 돌아봤을 때 걸린 사람이 탈락하는 방식으로 최종 등수가 결정됩니다.

## 🛠 기술 스택

- **Frontend**: React 19.1.0, TypeScript 4.9.5
- **Routing**: React Router DOM 7.6.3
- **Animation**: Framer Motion 12.23.0
- **Styling**: CSS3, Custom CSS
- **Build Tool**: Create React App
- **Deployment**: Netlify (예정)

## 📁 프로젝트 구조

```
src/
├── components/           # 재사용 가능한 컴포넌트
│   └── common/          # 공통 컴포넌트
│       ├── Button.tsx   # 버튼 컴포넌트
│       ├── Input.tsx    # 입력 컴포넌트
│       └── index.ts     # export 관리
├── hooks/               # 커스텀 훅
│   ├── useGameLogic.ts  # 게임 로직 관리
│   ├── useAnimation.ts  # 애니메이션 제어
│   └── useSound.ts      # 사운드 관리
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx     # 홈 페이지 (이름 입력)
│   ├── GamePage.tsx     # 게임 진행 페이지
│   └── ResultPage.tsx   # 결과 페이지
├── types/               # TypeScript 타입 정의
│   └── game.ts          # 게임 관련 타입
├── utils/               # 유틸리티 함수
│   ├── gameEngine.ts    # 게임 엔진
│   └── randomUtils.ts   # 랜덤 로직
└── App.tsx              # 메인 앱 컴포넌트
```

## 🚀 개발 진행 상황

### ✅ Phase 1 완료 (기본 구조)
- [x] Create React App 설정
- [x] 폴더 구조 생성
- [x] TypeScript 타입 정의
- [x] 기본 컴포넌트 제작 (Button, Input)
- [x] 페이지 컴포넌트 생성 (Home, Game, Result)
- [x] 라우팅 설정 (React Router)
- [x] 게임 엔진 구현
- [x] 커스텀 훅 개발
- [x] 전역 스타일 설정

### ✅ Phase 2 완료 (핵심 게임 로직 개선)
- [x] 실제 무궁화 꽃이 피었습니다 로직 구현
- [x] 음절별 랜덤 속도 표시 시스템
- [x] 술래 뒤돌기/돌아보기 정확한 구현
- [x] 움직임 감지 및 탈락 시스템
- [x] 골인 시스템 (100% 도달 시 즉시 승리)
- [x] 연속 게임 진행 (승부가 날 때까지 반복)
- [x] 결과 페이지 간소화 (등수 + 거리만 표시)
- [x] 새로하기/재시작 버튼 구현
- [x] 라운드 개념 제거 (자연스러운 게임 플로우)
- [x] 시각적 피드백 개선 (걸린 플레이어 표시)

### 🚧 다음 단계 (Phase 3)
- [ ] 고급 애니메이션 구현
- [ ] 사운드 시스템 추가
- [ ] 게임 설정 페이지
- [ ] PWA 지원
- [ ] 배포 설정

## 🎮 주요 기능

### 1. 홈페이지
- 참가자 이름 입력 (최대 10명)
- 중복 이름 체크 및 입력 유효성 검사
- 게임 규칙 안내

### 2. 게임 페이지
- **실제 게임 로직**: 술래가 뒤돌고 음절을 외칠 때만 이동 가능
- **음절 시스템**: "무궁화 꽃이 피었습니다"를 한 음절씩 랜덤 속도로 표시
- **움직임 감지**: 술래가 돌아볼 때 움직이는 플레이어 실시간 감지
- **즉시 탈락**: 걸린 플레이어 즉시 표시 및 탈락 처리
- **골인 시스템**: 100% 지점 도달 시 즉시 승리
- **연속 진행**: 승부가 날 때까지 자동으로 게임 반복
- **시각적 피드백**: 걸린 플레이어, 골인자 등 상태별 표시

### 3. 결과 페이지
- **간결한 표시**: 등수와 도달 거리만 표시
- **새로하기**: 처음부터 새로운 참가자로 게임 시작
- **재시작**: 같은 참가자들로 새 게임 진행
- **시각적 랭킹**: 등수별 아이콘 및 색상 구분

### 4. 게임 엔진
- **다중 게임 모드**: Normal, Fast, Slow, Intense
- **밸런스 조정**: 라운드별 난이도 증가
- **통계 시스템**: 실시간 게임 분석
- **시뮬레이션**: 게임 결과 미리보기 기능

## 🎨 디자인 특징

- **컬러 팔레트**: 한국 전통색 기반의 밝고 활기찬 색상
- **애니메이션**: Framer Motion을 활용한 부드러운 전환 효과
- **반응형**: 데스크탑과 모바일 모두 최적화
- **접근성**: 키보드 네비게이션과 스크린 리더 지원

## 📱 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build

# 테스트 실행
npm test
```

## 🎯 게임 규칙 (실제 무궁화 꽃이 피었습니다)

1. **준비**: 참가자 이름을 입력하고 게임을 시작합니다.
2. **게임 진행**: 
   - 술래가 뒤를 돌고 "무궁화 꽃이 피었습니다"를 한 음절씩 외칩니다
   - 음절이 나오는 동안만 플레이어들이 랜덤하게 전진할 수 있습니다 (30% 확률)
   - 술래가 모든 음절을 외치고 돌아볼 때 일부 플레이어는 계속 움직일 수 있습니다
3. **탈락 조건**: 
   - 술래가 돌아볼 때 움직이고 있는 플레이어는 즉시 탈락합니다
   - 움직이지 않는 플레이어는 안전합니다
4. **승리 조건**: 
   - **골인**: 100% 지점에 먼저 도달하면 즉시 승리
   - **생존**: 모든 플레이어가 탈락하고 마지막까지 살아남으면 승리
5. **게임 종료**: 
   - 누군가 골인하거나 활성 플레이어가 1명 이하 남을 때까지 반복
6. **등수 결정**: 골인자 1등 > 생존자 2등 > 탈락 순서 역순으로 등수 결정

## 🔧 개발 환경

- **Node.js**: 16.x 이상
- **npm**: 8.x 이상
- **Browser**: Chrome, Firefox, Safari, Edge (최신 버전)

## 📋 타입 정의

```typescript
interface Player {
  id: string;
  name: string;
  position: number;        // 현재 위치 (0-100)
  isEliminated: boolean;   // 탈락 여부
  eliminatedRound: number | null; // 탈락 라운드
  rank: number | null;     // 최종 등수
  color: string;          // 플레이어 색상
}

interface GameState {
  players: Player[];
  currentRound: number;
  gamePhase: 'preparation' | 'playing' | 'paused' | 'finished';
  isItLooking: boolean;    // 술래가 뒤돌아보는 중인지
  gameSpeed: number;       // 게임 속도 설정
  totalRounds: number;     // 총 라운드 수
}
```

## 🎈 애니메이션 효과

- **텍스트 애니메이션**: "무궁화 꽃이 피었습니다" 타이포그래피
- **플레이어 이동**: 부드러운 위치 변경 애니메이션
- **탈락 효과**: 스케일, 투명도, 회전을 조합한 탈락 표현
- **술래 애니메이션**: 3D 회전을 통한 돌아보기 효과

## 🚀 배포

이 프로젝트는 Netlify를 통해 배포됩니다.

```bash
# 빌드 명령어
npm run build

# 배포 폴더
build/
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 개발자

- **개발**: AI Assistant & Human Developer
- **디자인**: Custom CSS with Korean Traditional Colors
- **애니메이션**: Framer Motion

---

### 🎯 다음 개발 목표

1. **애니메이션 시스템 완성**
   - 플레이어 이동 애니메이션 구현
   - 탈락 효과 애니메이션 추가
   - 술래 돌아보기 3D 애니메이션

2. **게임 로직 개선**
   - 게임 밸런스 조정
   - 다양한 게임 모드 추가
   - 통계 및 기록 기능

3. **사용자 경험 향상**
   - 사운드 효과 추가
   - 더 많은 시각적 피드백
   - 접근성 개선

4. **성능 최적화**
   - 코드 스플리팅
   - 이미지 최적화
   - 메모리 사용량 최적화

현재 **Phase 1**이 완료되었으며, 모든 기본 구조와 컴포넌트가 구현되었습니다! 🎉
