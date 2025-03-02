const spells ={
    cbg:{
        base:2,
        percent:40,
        gfd:true,
        name:"Conjure Baked Goods"
    },
    fthof:{
        base:10,
        percent:60,
        gfd:true,
        name:"Force the Hand of Fate"
    },
    st:{
        base:8,
        percent:20,
        gfd:false,
        name:"Stretch Time"
    },
    se:{
        base:20,
        percent:75,
        gfd:false,
        name:"Spontaneous Edifice"
    },
    hc:{
        base:10,
        percent:10,
        gfd:true,
        name:"Haggler's charm"
    },
    scp:{
        base:10,
        percent:20,
        gfd:true,
        name:"Summon Crafty Pixies"
    },
    gfd:{
        base:3,
        percent:5,
        gfd:false,
        customtime:true,
        name:"Gambler's fever dream"
    },
    ra:{
        base:20,
        percent:10,
        gfd:false,
        name:"Resurrect Abomination"
    },
    di:{
        base:5,
        percent:20,
        gfd:true,
        name:"Diminish Ineptitude"
    }
}
const lvl = document.getElementById("level");
const count = document.getElementById("count");
const max = document.getElementById("maxmana");
const calcBestMagic = document.getElementById("calcOptimal")
const si = document.getElementById("SI");
const rb = document.getElementById("RB");
const manainfo = document.getElementById("manainfo");
const st = document.getElementById("Buffs");
const se = document.getElementById("SE");
const ra = document.getElementById("gpoc");
const dogfd = document.getElementById("dogfd");
const multi = document.getElementById("multi");
const gudRGN = document.getElementById("gudRegen");
const arbitrary = document.getElementById("arbitraryCast");
const ACmagicLeft = document.getElementById("ACmagicLeft");

let discount = 1;
let fasterRegen = false;
let spelldisplays = [];
for(i=1; i <=9; i++){
    spelldisplays.push(document.getElementById("spell"+i))
}
function getRegenTime(start, max){
    let a = start;
    let b = 0;
    while(a<max){
        curMax = fasterRegen ? Math.ceil(a + 1) : max;
        a+=Math.max(0.002,Math.pow(a/Math.max(curMax,100),0.5))*0.002
        b++;
    }
    return b/30;
}

function averageGFDtime(magic, buffs, gpoc, edifice, layers, extra){
    let a = cost(3, 0.05, magic);
    let curMax = Math.ceil(magic-extra)
    let b = 0;
    let c = 0;
    for(let spell in spells){
        let me = spells[spell];
        if(me.gfd){
            let price = cost(me.base,me.percent/100,magic)/2;
            if(curMax>a+price){
                b+=layers>1?averageGFDtime(magic, buffs, gpoc, edifice, layers-1, price+a+extra):getRegenTime(magic-price-a-extra,magic);
                c++;
            }
        }
    }
    //Stretch time
    let stprice = cost(8,0.2,magic)/2;
    if(curMax>a+stprice){
        b+=layers>1?!buffs*averageGFDtime(magic, buffs, gpoc, edifice, layers-1, stprice+a+extra):!buffs*getRegenTime(magic-stprice-a-extra,magic);
        c++;
    }
    //Spontaneous Edifice
    let seprice = cost(20,0.75,magic)/2;
    if(curMax>a+seprice){
        let sebackfire=edifice?0:1
        b+=layers>1?averageGFDtime(magic, buffs, gpoc, edifice, layers-1, seprice+a+extra)/2:getRegenTime(magic-seprice-a-extra,magic)/2;
        c++;
        b+=layers>1?averageGFDtime(magic, buffs, gpoc, edifice, layers-1, extra+(a+seprice)*sebackfire)/2:getRegenTime(magic-((a+seprice)*sebackfire)-extra, magic)/2;
    }
    //Resurrect Abomination
    let raprice = cost(20,0.1,magic)/2;
    if(curMax>a+raprice){
        b+=layers>1?gpoc*averageGFDtime(magic, buffs, gpoc, edifice, layers-1, seprice+a+extra):gpoc*getRegenTime(magic-a-raprice-extra, magic)
        c++;
    }
    if(isNaN(b)) return " Unable to cast";
    return c==0? " Unable to cast":(Number(multi.value)==layers?" Average recharge time: ":0)+Math.round(b/c*1000)/1000;
}
function cost(base, percent, magic){
    return Math.floor(base*discount+magic*percent*discount);
}
function multiCost(base, percent, magic, castCount, minMagic, str){
    let manacoststr = "";
    let realmanacost = 0;
    let mana = magic;
    for(let e = castCount; e>0; e--){
        let manacost = cost(base, percent/100, mana);
        mana -= manacost
        mana = Math.max(mana,minMagic);
        realmanacost += Number(manacost);
        if(str) {
            manacoststr += manacost;
            if(e>1){
                manacoststr+= " + "
            }
        }
    }
    return [realmanacost, manacoststr];
}


function getMaxMagic(level, count){
    return Math.floor(4+Math.pow(count,0.6)+Math.log((count+(level-1)*10)/15+1)*15);
}
function calculateStuff(){   
    
    //cap values
    if(count.value<1)count.value=1;
    if(lvl.value<1)lvl.value=1;
    if(max.value>10000)max.value=10000;
    if(max.value<1)max.value=1;
    if(multi.value>50)multi.value=50;
    if(multi.value<1)multi.value=1;

    //Initialize variables from input
    discount = 1-0.1*si.checked-0.01*rb.checked
    fasterRegen = gudRGN.checked;
    const towers = Number(count.value);
    const level = Number(lvl.value);
    const maximum = Number(max.value);
    const calcBest = calcBestMagic.checked;
    const buffs = st.checked;
    const edifice = se.checked;
    const gpoc = ra.checked;
    const calcGFD = dogfd.checked;
    const castnum = Number(multi.value);

    //max magic calculation
    const minmana = getMaxMagic(level, 1);
    manainfo.innerHTML = "With those numbers, your maximum mana would be "+ getMaxMagic(level, towers) +", and the lowest maximum mana you could reach would be " + minmana;

    //spell calculation
    let i = 0;
    for(const spell in spells){
        let me = spells[spell];
        if(me.customtime){
            if(calcGFD)spelldisplays[i].innerHTML = me.name+":<br>Mana cost: " + cost(me.base, me.percent/100, maximum)  +"<br>"+ (averageGFDtime(maximum, !buffs, gpoc, edifice, castnum, 0));
            else spelldisplays[i].innerHTML = me.name+":<br>Not calculating this right now<br> (Due to your settings)";
        }else{
            let output = multiCost(me.base, me.percent, maximum, castnum, minmana, true)
            let realmanacost = output[0];
            let manacoststr = output[1];
            let str = me.name+":<br>Mana cost: " +  manacoststr  +"<br>"+ (maximum<realmanacost? "    Unable to cast":" Recharge time: "+Math.round(getRegenTime(maximum-realmanacost, maximum)*1000)/1000+" seconds");
            let a = 0;
            let bestTime = 0;
            if(calcBest){
                //calculate optimal max magic for spell up to max magic
                for(let i=5; i<maximum; i++){
                    let cost = (multiCost(me.base, me.percent, i, castnum, minmana, false))[0];
                    if(cost > i) continue;
                    b = getRegenTime(i-cost, i);
                    if((b<bestTime||a==0)&& !isNaN(b)){
                        a = i;
                        bestTime=b;
                    }
                }
            }
            spelldisplays[i].innerHTML = str + (calcBest?"<br>"+ bestTime.toFixed(2) + " seconds with a maximum mana of " + a:"");
        }
        i++;
    }    
}


function arbitraryCalc(){
    const level = Number(lvl.value);
    const minMagic = getMaxMagic(level, 1);
    const magicleft = Number(ACmagicLeft.value);
    function error(str="invalid input"){alert(str); document.getElementById("arbitraryCastOutput").innerHTML = "you idiot, you fool, you absolute buffoon";}

    const castSet = arbitrary.value;
    const casts = castSet.split(" ");
    let str = []
    for(let e of [100, 10, 1]){
        let totcost = 0;
        let towCounts = [];
        for(let i = casts.length-1; i>-1; i--){
            let curCast = casts[i];
            let curCasts=curCast.split("-");
            let per = new Array(curCasts.length)
            let base = new Array(curCasts.length)
            let gfd = new Array(curCasts.length)
            for(let i = 0; i<curCasts.length;i++){
                if(curCasts[i].startsWith("g!")){curCasts[i]=curCasts[i].slice(2); gfd[i]=true;} 
                if(spells[curCasts[i]]){
                    let spell = spells[curCasts[i]]
                    per[i] = spell.percent;
                    base[i] = spell.base;
                }else if(curCasts[i].split("%+").length==2){
                    per[i] = Number(curCasts[i].split("%+")[0])
                    base[i] = curCasts[i].split("%+")[1]
                    if(isNaN(per[i])||isNaN(base[i])){error("Couldn't parse numbers in: "+curCasts[i]);return;}
                }
                else {error("Couldn't parse cast: "+curCasts[i]);return;}
            }
            let persum = per.reduce((sum, val, index)=>{return sum+(gfd[index]?(0.5*val + spells.gfd.percent):val)},0);
            let basesum = base.reduce((sum, val, index)=>{return sum+(gfd[index]?(0.5*val + spells.gfd.base):val)},0);
            if((persum * discount == 100 && basesum>0) || persum * discount > 100){error("Go get a better discount for cast set: " + curCast + "(or blame nyan cat if you could actually cast this)");return;}
            //find minimum magic to afford this
            let b = 0;
            for(b = minMagic; true;b++){
                let thiscost=0;
                for(let i = 0; i<curCasts.length;i++){
                    if(gfd[i]) thiscost += cost(base[i], per[i]/100, b)/2+cost(spells.gfd.base, spells.gfd.percent/100, b)
                    else thiscost+=cost(base[i], per[i]/100, b)
                }
                if(magicleft+totcost+thiscost <= b){
                    break;
                }
            }

            //find minimum towers
            let towers = 1;
            let low = 1;
            let high = Infinity;
            while(true){
                //too low
                if(getMaxMagic(level, towers)<b) {
                    low = towers;
                    if(high == Infinity) towers=low*2;
                    else towers = Math.floor((high+low)/2);
                    continue;
                }
                //too high
                if(getMaxMagic(level, towers)>=b && getMaxMagic(level,towers-1)>=b) {
                    high = towers; towers = Math.floor((high+low)/2);
                    continue;
                }
                //right value
                break;
            }
            if(totcost>0){towers = towCounts[0]+e*Math.ceil((towers-towCounts[0])/e)}
            let max = getMaxMagic(level, towers)
            
            for(let i = 0; i<curCasts.length;i++){
                if(gfd[i]) totcost += cost(base[i], per[i]/100, max)/2+cost(spells.gfd.base, spells.gfd.percent/100, max)
                else totcost+=cost(base[i], per[i]/100, max)
            }
            towCounts.push(towers);
        }
        str.push("Selling by " + e +"&nbsp".repeat(3-String(e).length)+ ": "+towCounts.join(", ")+" For total of "+totcost+" magic");
    }
    document.getElementById("arbitraryCastOutput").innerHTML = str.join("<br>")
}

calculateStuff()