const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

const angleInput = document.getElementById('angle');
const velocityInput = document.getElementById('velocity');
const gravityInput = document.getElementById('gravity');
const airResistanceInput = document.getElementById('airResistance');
const windDirectionInput = document.getElementById('windDirection');
const windSpeedInput = document.getElementById('windSpeed');
const showTrajectoryInput = document.getElementById('showTrajectory');
const startButton = document.getElementById('startButton');
const infoBox = document.getElementById('infoBox');

// 바람 입자 배열
const windParticles = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
}));

// 도 단위를 라디안으로 변환하는 함수
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// 화살표를 그리는 함수
function drawArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10; // 화살표 머리 길이
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // 화살표 몸체 그리기
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 화살표 머리 그리기
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(toX, toY);
    ctx.fillStyle = color;
    ctx.fill();
}

// 바람을 그리는 함수
function drawWind(windSpeed, windDirection) {
    const speed = Math.abs(windSpeed) * 2; // 바람 세기에 따른 속도 조정
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.lineWidth = 1;
    windParticles.forEach(particle => {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + windDirection * speed, particle.y);
        ctx.stroke();

        // 입자 위치 업데이트
        particle.x += windDirection * speed;
        if (particle.x > canvas.width && windDirection > 0) {
            particle.x = 0;
            particle.y = Math.random() * canvas.height;
        } else if (particle.x < 0 && windDirection < 0) {
            particle.x = canvas.width;
            particle.y = Math.random() * canvas.height;
        }
    });
}

// 포물선 운동 시뮬레이션 함수
function simulateProjectileMotion() {
    const angle = toRadians(parseFloat(angleInput.value)); // 발사 각도
    const velocity = Math.min(parseFloat(velocityInput.value), 100); // 초기 속도 (최댓값 제한)
    const gravity = Math.min(parseFloat(gravityInput.value), 20); // 중력 가속도 (최댓값 제한)
    const airResistance = Math.min(parseFloat(airResistanceInput.value), 1); // 공기 저항 계수 (최댓값 제한)
    const windDirection = parseFloat(windDirectionInput.value); // 바람 방향 (1: 오른쪽, -1: 왼쪽)
    const windSpeed = parseFloat(windSpeedInput.value) * windDirection; // 바람 세기
    const showTrajectory = showTrajectoryInput.checked; // 궤적 표시 여부

    let velocityX = velocity * Math.cos(angle); // 가로 방향 초기 속도도
    let velocityY = velocity * Math.sin(angle); // 세로 방향 초기 속도

    let positionX = 0; // 가로 위치 초기값
    let positionY = 0; // 세로 위치 초기값

    const timeStep = 0.02; // 시간 간격
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trajectoryPoints = []; // 궤적 좌표 저장 배열

    function drawFrame() {
        if (showTrajectory) {
            // 궤적 좌표 저장
            trajectoryPoints.push({ x: positionX, y: positionY });
        }

        // 위치 업데이트
        positionX += velocityX * timeStep;
        positionY += velocityY * timeStep;

        // 속도 업데이트 (공기 저항과 중력 적용)
        const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2); // 속도의 크기 계산
        const dragForce = airResistance * speed; // 공기 저항력 계산
        const dragAccelerationX = (dragForce * (velocityX / speed)) - windSpeed; // 가로 방향 저항 가속도
        const dragAccelerationY = (dragForce * (velocityY / speed)); // 세로 방향 저항 가속도

        velocityX -= dragAccelerationX * timeStep;
        velocityY -= (gravity + dragAccelerationY) * timeStep;

        // 화면 좌표 변환
        const canvasX = positionX * (canvas.width / 100); // 가로 위치 변환
        const canvasY = canvas.height - (positionY * (canvas.height / 50)); // 세로 위치 변환

        // 캔버스 초기화 및 바람 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWind(windSpeed, windDirection);

        if (showTrajectory) {
            ctx.beginPath();
            trajectoryPoints.forEach((point, index) => {
                const x = point.x * (canvas.width / 100);
                const y = canvas.height - (point.y * (canvas.height / 50));
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.strokeStyle = 'lightblue';
            ctx.stroke();
        }

        // 공 그리기
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();

        // 가로 및 세로 속도 벡터 그리기
        const vectorScale = 2.5; // 벡터 크기 조정 (스케일 축소)
        drawArrow(
            canvasX,
            canvasY,
            canvasX + (velocityX * vectorScale),
            canvasY,
            'green' // 가로 방향 벡터 색상
        );
        drawArrow(
            canvasX,
            canvasY,
            canvasX,
            canvasY - (velocityY * vectorScale),
            'orange' // 세로 방향 벡터 색상
        );

        // 속도 정보 업데이트
        infoBox.textContent = `현재 속도: ${speed.toFixed(2)} m/s`;

        // 시뮬레이션 종료 조건 확인
        if (
            positionY <= 0 && velocityY < 0 || // 공이 지면에 닿았을 때
            canvasX > canvas.width || // 공이 화면 오른쪽을 벗어났을 때
            canvasY > canvas.height || // 공이 화면 아래를 벗어났을 때
            canvasY < 0 // 공이 화면 위를 벗어났을 때
        ) {
            return;
        }

        requestAnimationFrame(drawFrame); // 다음 프레임 호출
    }

    drawFrame(); // 첫 프레임 그리기
}

    startButton.addEventListener('click', simulateProjectileMotion); // 시작 버튼 클릭 이벤트