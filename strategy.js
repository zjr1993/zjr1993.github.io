
function randomChoice(arr) {
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

class strategy {
    constructor() {
        // 预测器数量
        this.num_predictors = 27;

        // 模式匹配的最大搜索深度
        this.max_search_depth = 20;

        // 回溯的长度列表
        this.traceback_depths = [10, 20, 60];

        // 游戏的克制字典 ✊ Rock, 🖐 Paper, ✌️ Scissor
        this.BEAT = {
            'R': 'P',
            'P': 'S',
            'S': 'R'
        }

        // 每种选择对应的三种至少不输的选择字典
        this.NOT_LOSE={
            'R': 'PPR',
            'P': 'SSP',
            'S': 'RRS'
        }

        // 将9种可能的对局组合 ✊✊，✊🖐，✌️🖐，... 转换成1～9个数字, 方便存储💾和后续搜索🔍
        this.PAIR_TO_NUM = {
            'PP': '1', 'PR': '2', 'PS': '3',
            'RP': '4', 'RR': '5', 'RS': '6',
            'SP': '7', 'SR': '8', 'SS': '9'
        }

        // 互换键值形成反向查询字典
        this.NUM_TO_PAIR = Object.fromEntries(
            Object.entries(this.PAIR_TO_NUM).map(([k, v]) => [v, k])
        );
        
        // 第一个字母代表人，第二个字母代表电脑AI
        this.WHO_WIN = {
            'PP': 0, 'PR': 1, 'PS': -1,
            'RP': -1, 'RR': 0, 'RS': 1,
            'SP': 1, 'SR': -1, 'SS': 0
        }

        // 记录历史出拳数据
        // 电脑AI的历史数据
        this.robotRecord   = "";

        // 人类玩家的历史数据
        this.humanRecord = "";

        // 双方的历史数据
        this.bothRecord = "";

        // 回合数量
        this.roundCount = 0;

        // 预测器状态追踪
        // listPredictor: 使用数组存储每个预测器最近5局的命中结果(1或0)
        // listPredictor = [[1,1,0,1,0],[1,0,0,1,0],[0,0,0,1,0],...,[1,0,0,1,1]]
        this.listPredictor = Array.from({length: this.num_predictors}, ()=>[]);

        // 初始化第一局随机出拳
        let initChoice= this._getRandomRPS();

        // 将预测器都初始化成同一个值
        this.predictors = new Array(this.num_predictors).fill(initChoice);
        this.lastOutput = initChoice;
    }

    /**
     * 获取随机出拳 (内部辅助方法)
     * @returns {string} 'R', 'P', 或 'S'
    */
    _getRandomRPS() {
        const rps = "RPS";
        return rps[Math.floor(Math.random()*3)];
    }

    /**
     * 核心预测 API
     * @param {string} opponentInput - 玩家上一局的出拳 ('R', 'P', 'S')。第一局请传入 "" 或 null
     * @returns {string} - AI 本局的最佳出拳 ('R', 'P', 'S')
    */
    predict(opponentInput) {
        // 第一局游戏， 直接返回初始化的随机选择
        if (!opponentInput) {
            return this.lastOutput;
        }
        // 1. 根据对手上一局真实出拳，更新各预测器的准确度记录 (最多保留最近5局)
        for (let i=0; i< this.num_predictors; i++) {
            // isHit=1 代表准确命中
            const isHit = (this.predictors[i] === opponentInput) ? 1:0;
            // 更新每个预测器
            this.listPredictor[i].push(isHit);
            if (this.listPredictor[i].length >5) {
                // 保持滑动窗口大小为5
                this.listPredictor[i].shift();
            }
        }
        // 2. 更新历史记录
        this.robotRecord += this.lastOutput;
        this.humanRecord += opponentInput;
        this.bothRecord += this.PAIR_TO_NUM[opponentInput + this.lastOutput];
        this.roundCount++;

        // lenSize 是实际的最大搜索长度
        const lenSize = Math.min(this.roundCount, this.max_search_depth);

        // findMatch 是匹配函数
        const findMatch = (historyStr)=>{
            if (this.roundCount <= 1) return -1;
            const searchSpace = historyStr.substring(0, this.roundCount - 1);
            let idx = -1;
            let j = lenSize;
            while(j >= 1) {
                const target = historyStr.substring(this.roundCount - j, this.roundCount);
                idx = searchSpace.lastIndexOf(target);
                if (idx !== -1) {
                    break;
                }
                j--;
            }
            return idx === -1 ? -1 : idx + j;
        };

        // 策略组1：基于双方历史
        let matchIdx = findMatch(this.bothRecord);
        if (matchIdx !== -1) {
            // 直接预测历史上人类玩家的后续行动
            this.predictors[0] = this.humanRecord[matchIdx];

            // 直接预测为历史上人类玩家的后续行动的克制行动
            this.predictors[1] = this.BEAT[this.predictors[0]];
        }
        else {
            // 无历史数据匹配， 随机生成一个选择
            this.predictors[0] = this._getRandomRPS();
            this.predictors[1] = this._getRandomRPS();
        }

        // 策略组2：基于对手历史
        matchIdx = findMatch(this.humanRecord);
        if (matchIdx !== -1) {
            this.predictors[2] = this.humanRecord[matchIdx];
            this.predictors[3] = this.BEAT[this.predictors[2]];
        }
        else {
            this.predictors[2] = this._getRandomRPS();
            this.predictors[3] = this._getRandomRPS();
        }

        // 策略组3：基于AI自身历史
        matchIdx = findMatch(this.robotRecord);
        if (matchIdx !== -1) {
            this.predictors[4] = this.humanRecord[matchIdx];
            this.predictors[5] = this.BEAT[this.predictors[4]];
        } else {
            this.predictors[4] = this._getRandomRPS();
            this.predictors[5] = this._getRandomRPS();
        }

        // 4. 频率与条件概率分析 (Predictors 6-8)
        // 2阶马尔卡夫链
        const lastCombo = this.bothRecord.at(-1);
        for (let i=0; i<3; i++) {
            let temp = "";
            const limitVal = Math.min(this.traceback_depths[i], this.roundCount);

            for (let start=2; start < limitVal; start++) {
                if (lastCombo === this.bothRecord[this.roundCount - start]){
                    temp += this.bothRecord[this.roundCount-start+1];
                }
            }

            if (temp === "") {
                this.predictors[6+i] = this._getRandomRPS();
            }
            else {
                const collectR = { 'P': 0, 'R': 0, 'S': 0 };
                for (let c of temp) {
                    const nextMove = this.NUM_TO_PAIR[c];
                    const winState = this.WHO_WIN[nextMove];

                    // 电脑AI赢了
                    if (winState === -1) {
                        // 打不过就加入
                        collectR[nextMove[1]] += 3
                    }
                    else if (winState === 0) {
                        collectR[nextMove[0]] += 1;
                    }
                    // 人赢了
                    else if (winState === 1){
                        // 直接变换策略
                        collectR[this.BEAT[nextMove[0]]] +=1
                    }
                }
                let maxWeight = -1;
                let bestMoves = "";
                for (let key in collectR){
                    if (collectR[key] > maxWeight) {
                        maxWeight = collectR[key];
                        bestMoves = key;
                    }
                    else if (collectR[key] === maxWeight) {
                        bestMoves += key;
                    }
                }
                this.predictors[6+i] = randomChoice(bestMoves);
            }
        }
        // 5. 元推理反转预测 (Predictors 9-27)
        for (let i = 9; i < 27; i++) {
            // 预测器的预测器：连续两次克制反转，模拟更高维度的博弈预判
            this.predictors[i] = this.BEAT[this.BEAT[this.predictors[i - 9]]];
        }

        // 6. 用距离加权来评判各组策略的得分
        let maxScore = -Infinity;
        let bestIdx = -1;

        // 当前的得分计数长度
        const historyLen = this.listPredictor[0].length;
        
        for (let i = 0; i< this.num_predictors; i++){
            let sum = 0;
            for (let j=0; j < historyLen; j++) {
                const weight = (j+1) * (j+1);
                if (this.listPredictor[i][j] === 1) {
                    sum += weight;
                }
                else {
                    sum -= weight;
                }
            }

            // this.scorePredictor[i] = sum;
            if (sum > maxScore) {
                maxScore = sum;
                bestIdx = i;
            }
        }

        // 选出最佳预判
        let predictedOpponentMove;
        if (maxScore >0) {
            predictedOpponentMove = this.predictors[bestIdx];
        }
        else {
            predictedOpponentMove = randomChoice(this.humanRecord) || this._getRandomRPS();
        }
        this.lastOutput = randomChoice(this.NOT_LOSE[predictedOpponentMove]);
        return this.lastOutput;
    }
}
