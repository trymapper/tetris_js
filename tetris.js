// 落ちるスピード
const GAME_SPEED = 500

// フィールドサイズ
const FIELD_COL = 10
const FIELD_ROW = 20

// ブロック一つのサイズ(ピクセル)
const BLOCK_SIZE = 30

// スクリーンサイズ
const SCREEN_W = BLOCK_SIZE * FIELD_COL
const SCREEN_H = BLOCK_SIZE * FIELD_ROW

// テトロミノのサイズ
const TETRO_SIZE = 4

const TETRO_COLORS = [
    "#555",        //0空
    "#6CF",        //1水色
    "#F92",        //2オレンジ
    "#66F",        //3青
    "#C5C",        //4紫
    "#FD2",        //5黄色
    "#F44",        //6赤
    "#6B6"         //7緑
]

const TETRO_TYPES = [
    [],                 // 0.空
    [                   // 1.I
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [                   // 2.L
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                   // 3.J
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                   // 4.T
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [                   // 5.O
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                   // 6.Z
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [                   // 7.S
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]
    ]
]

// 初期位置
const START_X = FIELD_COL/2 - TETRO_SIZE/2
const START_Y = 0

// テトロミノ本体
let tetro

// テトロミノの座標
let tetro_x = START_X
let tetro_y = START_Y

// テトロミノの形
let tetro_t

// フィールドの中身
let field = []

// ゲームオーバーフラグ
let over = false

// 消したらライン数
let lines = 0

// スコア
let score = 0

// スピード
let speed = 0
let speed_level = 1

// 地面についてから動かせるようにするためのフラグ
let drop_flag = false
let start_frag = false

// let tetro_n = 0

// ゲームフィールドの位置
const OFFSET_X = 40
const OFFSET_Y = 20

// キャンバス全体のサイズ
const CANVAS_W = (BLOCK_SIZE * FIELD_COL + OFFSET_X) * 2
const CANVAS_H = BLOCK_SIZE * FIELD_ROW + OFFSET_Y * 2

// キャンバスの設定
let can = document.getElementById("can")
let con = can.getContext("2d")

can.width = CANVAS_W
can.height = CANVAS_W

drawFlame()
drawInfo()

function game_start()
{
    init()
    drawALL()
    start_frag = true
}

// 初期化
function init()
{
    // フィールドのクリア
    for(let y=0; y<FIELD_ROW; y++)
    {
        field[y] = []
        for(let x=0; x<FIELD_COL; x++)
        {
            field[y][x] = 0
        }
    }

    // 枠の描画
    drawFlame()
    drawInfo()

    // 最初のテトロのためのネクストを入れる
    tetro_n = Math.floor(Math.random()*(TETRO_TYPES.length-1)) + 1
    setTetro()
    drawALL()
    over = false
    speed_level = 1
    speed = 0
    score = 0
    init_interval = setInterval(dropTetro, GAME_SPEED)
}

// テトロをネクストで初期化
function setTetro()
{
    // ネクストを現在のテトロにする
    tetro_t = tetro_n
    tetro = TETRO_TYPES[tetro_t]
    tetro_n = Math.floor(Math.random()*(TETRO_TYPES.length-1)) + 1

    // 位置を初期値にする
    tetro_x = START_X
    tetro_y = START_Y
}

// ブロック一つを描画する
function drawBlock(x, y, c)
{
    let px = x * BLOCK_SIZE
    let py = y * BLOCK_SIZE
    con.fillStyle=TETRO_COLORS[c]
    con.fillRect(px + OFFSET_X, py + OFFSET_Y, BLOCK_SIZE, BLOCK_SIZE)
    con.strokeStyle="black"
    con.strokeRect(px + OFFSET_X, py + OFFSET_Y, BLOCK_SIZE, BLOCK_SIZE)
}

// 枠の描画
function drawFlame()
{
    con.strokeStyle="gray"
    con.lineWidth=2
    con.strokeRect(OFFSET_X, OFFSET_Y, SCREEN_W, SCREEN_H)
    con.strokeStyle="red"
    con.beginPath();
    con.moveTo(OFFSET_X, OFFSET_Y + BLOCK_SIZE * 2);
    con.lineTo(OFFSET_X + SCREEN_W, OFFSET_Y + BLOCK_SIZE * 2);
    con.closePath();
    con.stroke();
    con.lineWidth=1
}

// 全部描画する
function drawALL()
{
    con.clearRect(OFFSET_X, OFFSET_Y, SCREEN_W + OFFSET_X, SCREEN_H + OFFSET_Y)
    con.clearRect(0, 0, CANVAS_W, CANVAS_H)

    drawFlame()

    // フィールドの描画
    for(let y=0; y<FIELD_ROW; y++)
    {
        for(let x=0; x<FIELD_COL; x++)
        {
            if(field[y][x])
            {
                drawBlock(x, y, field[y][x])
            }
        }
    }

    // 着地点の計算
    let plus = 0
    while(checkMove(0, plus+1)) plus ++

    // テトロミノの描画
    for(let y=0; y<TETRO_SIZE; y++)
    {
        for(let x=0; x<TETRO_SIZE; x++)
        {
            // テトロ本体
            if(tetro[y][x])
            {
                // 着地点
                drawBlock(tetro_x+x, tetro_y + y + plus, 0)
                // 本体
                drawBlock(tetro_x + x, tetro_y + y, tetro_t)
                
            }
            // ネクストテトロ
            if(TETRO_TYPES[tetro_n][y][x])
            {
                drawBlock(13+x, 4+y, tetro_n)
            }
        }
    }
    drawInfo()
}

// インフォメーション表示
function drawInfo()
{
    let w
    con.fillStyle="black"
    con.strokeStyle="black"
    con.font = "10px 'ＭＳ ゴシック'";

    let s="NEXT"
    con.fillText(s, 410, 120)

    s="SCORE"
    con.fillText(s, 410, 300)
    s=""+score
    w = con.measureText(s).whidth
    con.font = "50px 'ＭＳ ゴシック'";
    con.fillText(s, 480, 340)
    con.font = "10px 'ＭＳ ゴシック'";

    s="SPEED LEVEL"
    w = con.measureText(s).width
    con.fillText(s, 410, 400)
    s=""+speed_level
    w = con.measureText(s).width
    con.font = "50px 'ＭＳ ゴシック'";
    con.fillText(s, 480, 440)
    con.font = "10px 'ＭＳ ゴシック'";

    if(!start_frag)
    {
        s="PRESS THE ENTER KEY"
        w = con.measureText(s).width
        let x = SCREEN_W/2 - w/2
        let y = SCREEN_H/2 - 20
        con.lineWidth = 10
        con.font = "28px 'ＭＳ ゴシック'";
        con.strokeText(s, OFFSET_X + x - 90, y)
        con.fillStyle="white"
        con.fillText(s, OFFSET_X + x - 90, y)
    }

    if(over)
    {
        s="GAME OVER"
        t="Press the enter key to restart"
        w = con.measureText(s).width
        let x = SCREEN_W/2 - w/2
        let y = SCREEN_H/2 - 20
        con.lineWidth = 15
        con.font = "50px 'ＭＳ ゴシック'";
        con.strokeText(s, OFFSET_X + x - 90, y)
        con.fillStyle="white"
        con.fillText(s, OFFSET_X + x - 90, y)
        con.lineWidth = 1
        con.font = "15px 'ＭＳ ゴシック'";
        con.strokeText(t, OFFSET_X + x - 90, y + 30)
    }

}

// ブロックの衝突判定
function checkMove(mx, my, ntetro)
{
    if(ntetro == undefined) ntetro = tetro
    for(let y=0; y<TETRO_SIZE; y++)
    {
        for(let x=0; x<TETRO_SIZE; x++)
        {
            let nx = tetro_x + mx + x
            let ny = tetro_y + my + y
            if(ntetro[y][x])
            {
                if( nx < 0 ||
                    ny < 0 || 
                    ny >= FIELD_ROW || 
                    nx >= FIELD_COL ||
                    field[ny][nx]) 
                {
                    return false
                }
            }
        }
    }
    return true
}

// テトロの回転
function rotate()
{
    let ntetro = []
    for(let y=0; y<TETRO_SIZE; y++)
    {
        ntetro[y] = []
        for(let x=0; x<TETRO_SIZE; x++)
        {
           ntetro[y][x] = tetro[TETRO_SIZE-x-1][y]
        }
    }
    return ntetro
}

// テトロを固定する処理
function fixTetro()
{
    for(let y=0; y<TETRO_SIZE; y++)
    {
        for(let x=0; x<TETRO_SIZE; x++)
        {
            if(tetro[y][x])
            {
                field[tetro_y + y][tetro_x + x] = tetro_t
            }
        }

    }
}

// ラインが揃ったかチェックして消す
function chekLine()
{
    let linec = 0
    for(let y=0; y<FIELD_ROW; y++)
    {
        let flag = true
        for(let x=0; x<FIELD_COL; x++)
        {
            if(!field[y][x])
            {
                flag = false
                break
            }
        }
        if(flag)
        {
            linec ++
            for(let ny = y; ny > 0; ny--)
            {
                for(let nx = 0; nx < FIELD_COL; nx++)
                {
                    field[ny][nx] = field[ny-1][nx]
                }
            }
        }
    }
    if(linec)
    {
        lines += linec
        if(linec == 1) score += 40
        if(linec == 2) score += 100
        if(linec == 3) score += 300
        if(linec == 4) score += 1200

        if(speed < GAME_SPEED - 10){
            speed += 30 * linec
            speed_level += linec
            clearInterval(init_interval)
            init_interval = setInterval(dropTetro, GAME_SPEED - speed)
            console.log(speed)
        } 

        playSound()
        
    }
}

function playSound()
{
    adioElem = new Audio()
    adioElem.src = "hello.wav"
    adioElem.play()
}


// ブロックの落ちる処理
function dropTetro()
{
    if(over) return
    if (checkMove(0, 1)) tetro_y ++
    else
    {
        if(! drop_flag)
        {
            drop_flag = true
            // return
        }
        else
        {
            fixTetro()
            chekLine()
            setTetro()

            for(let i = 0; i<field[0].length; i++)
            {
                if(field[2][i])
                {
                    over = true
                    clearInterval(init_interval)
                    drawInfo()
                    break
                }
            }
            drop_flag = false
        }
        
    }

    if(!over) drawALL()
}

// キーボードが押されたときの処理
document.onkeydown = function(e)
{
    if(over) {
        if(e.keyCode == 13){
            init()
            over = false
        }
        return
    }

    if(!start_frag){
        if(e.keyCode ==13){
            game_start()
        }
    }    
    switch(e.keyCode)
    {
        case 37:
            if(checkMove(-1, 0)) tetro_x --
            break
        case 85:
            if(checkMove(0, -1)) tetro_y --
            break
        case 39:
            if(checkMove(1, 0)) tetro_x ++
            break
        case 40:
            if(checkMove(0, 1)) tetro_y ++
            break
        case 32: //スペース
            let ntetro = rotate()
            if(checkMove(0, 0, ntetro)) tetro = ntetro
            break
    }
    drawALL()
}