//время до появления медального окна 1, зависящее от размера страницы
var timeout;
var countignore = 0;
var ignore = true;
var dialogOn = false;

//подготовка активной среды (создание окон)
function prepare_environment(){

	//окна активной среды
	timeout=document.body.innerHTML.length;
	//диалоговый модуль
	document.body.innerHTML+="<div id='dialog' class='dialog' style='margin-left:-40px;'>"+
		"<div class='label' onclick='toggleDialog()'>Нажми, чтобы спросить!</div>"+
		"<div class='header'>История:</div>"+
		"<div class='history' id='history'></div>"+
		"<div class='question'><input id='Qdialog' placeholder='Введите вопрос'  onKeyDown='if(event.keyCode==13)ask(&quot;Qdialog&quot;)'/><br>"+
			"<button onclick='ask(\"Qdialog\")'>Спросить</button>"
		"</div>"+
	"</div>";
	//крупный план изображений
	document.body.innerHTML += "<div id='imgalert' style='display:none'>" + "<div class='bg' onclick='hide(\"imgalert\")'>&nbsp;</div>" + "<img id='img_in_alert' src='' />" + "</div>";

	//РАСПОЗНАВАНИЕ РЕЧИ
	//поле с распознаванием речи. Задаем API-ключ

	window.ya.speechkit.settings.apikey = '5c6d6536-b453-4589-9bc7-f16c7a795106';

	// Добавление элемента управления "Поле для голосового ввода".

	var textline = new ya.speechkit.Textline(
		'Qdialog', {
			onInputFinished: function(text) {
			ask("Qdialog");
		  }
		});

	//КОНЕЦ РАСПОЗНАВАНИЯ РЕЧИ
	//привязка окон активной среды с событиями. Показ модального окна 1 через интервал времени, зависящий от размера страницы

	timer=setInterval(alert_over_time, timeout);

	try {
		//открытие журналов посещенных адресов и дат посещения:
		//попытка использования массива адресов открытых страниц из локального хранилища
		var URLlog=JSON.parse(localStorage.URLlog);
		//удаление адресов из начала массива, пока в массиве не останется 5 адресов
		while(URLlog.length>5) URLlog.shift(0);
		//попытка использоваения массива дат открытия страниц из локального хранилища
		var log=JSON.parse(localStorage.log);
		//удаление дат из начала массива, пока в массиве не останется 5 дат
		while(log.length>5) log.shift(0);
		//проверка на необходимость срабатывания реакций:
		//только если сделан переход со страницы на страницу (не обновление страницы)
		if(location.href!=URLlog[URLlog.length-1]){
			//если сделан переход на одну из последних пяти посещенных страниц,
			//очищаем массив и показываем модальное окно 3
			if(URLlog.indexOf(location.href)!==-1){
				while(URLlog.length>0) URLlog.shift(0);//очистка массива адресов
				alert_for_back();
			}
			//только если не возникла реакция возврата на предыдущий адрес
			//проверяем необходимость реакции на быстрые переходы:
			else{
				//если сделано 5 переходов меньше чем за минуту -
				//очищаем массив и показываем модальное окно 2
				if(log.length>=5 &&  ((new Date())-Date.parse(log[0]))<60000){
					while(log.length>0) log.shift(0);//очистка массива дат
					alert_for_speed();
				}
			}
			//в любом случае, независимо от срабатывания реакций, при переходе со страницы на страницу:
			URLlog.push(location.href);	//запись адреса текущей страницы в массив
			log.push(new Date());		//запись даты перехода в массив
		}
	}
	catch(e){
		var URLlog=new Array();	//инициализация массива адресов открытых страниц
		var log=new Array();	//инициализация массива дат открытия страниц
	}
	//запись массива адресов в локальное хранилище в формате JSON
	localStorage.URLlog=JSON.stringify(URLlog);
	//запись массива дат в локальное хранилище в формате JSON
	localStorage.log=JSON.stringify(log);

}
//запуск подготовки среды при загрузке окна
window.onload = function(){prepare_environment();};
//скрытие сообщений при щелчке на фон
function hide(elem_id){
	$("#" + elem_id).css({"display" : "none"});
	timer = setInterval(alert_over_time, timeout);
	if(ignore)
	{
		try
		{
			var countignore = localStorage.getItem("countignore");
		}
		catch(e)
		{
			localStorage.setItem("countignore", countignore);
		}
		countignore++;
		localStorage.setItem("countignore", countignore);
		if(countignore > 2) alert_for_ignore();
	}
	else
	{
		localStorage.setItem("countignore", 0);
	}
	ignore = true;
}

//показ сообщений
function alert_over_time(){
	$("#alert1").css({"display":"block"});
	clearInterval(timer);
}

function alert_for_speed(){
	$("#alert2").css({"display":"block"});
	clearInterval(timer);
}

function alert_for_back(){
	$("#alert3").css({"display":"block"});
	clearInterval(timer);
}
//ДИАЛОГ
//показ-скрытие диалогового модуля
function toggleDialog() {
	//закрытие
	if(dialogOn)
	{
		$("#dialog").animate({"margin-left":"-40px"}, 1000, function() {});
		dialogOn=false;
		timer=setInterval(alert_over_time, timeout);
	}
	//открытие
	else
	{
		$("#dialog").animate({"margin-left":"-400px"}, 1000, function() {});
		dialogOn=true;
		clearInterval(timer);
	}
}

//база знаний
var knowledge = [
    ["уравновешенный мост","- это","электрическая схема используемая для измерения сопротивлений и емкостей элементов цепи"],
    ["уравновешенный мост","выглядит","так <br/><a href='images/dist/chema1.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],
    ["переменный ток","- это","электрический ток, который с течением времени изменяется по величине и направлению"],
    ["индуктивность","- это","физическая (электрическая) величина, которая характеризует магнитные свойства электрической цепи."],
    ["емкость конденсатора","- это","способность данного элемента накапливать электрический заряд"],
    ["сопротивление конденсатора","- это","утечка тока из, вызывающее его сопротивление"],
    ["напряжение","- это","величина, численно равная работе по перемещению единицы электрического заряда между двумя произвольными точками электрической цепи. "],
    ["сопротивление","- это","физическая величина, характеризующая противодействие проводника или электрической цепи электрическому току"],
    ["сила тока","- это","физическая величина, равная отношению заряда, который переносится через поперечное сечение проводника за определенное время, к этому времени."],
    ["внутреннее сопротивление","- это","когда ток совершает работу не только на внешнем, но и на внутреннем участке цепи"],
    ["плечо моста","- это","элементы образующие измерительный мост"],
    ["активное сопротивление проводника","- это","проводник, включенный в цепь переменного тока и неимеющий заметных индуктивности и емкости"],
    ["полное сопротивление","- это","величина, характеризующая сопротивление электрической цепи току"],
    ["формула полного сопротивления плеча","выглядит","так <br/><a href='images/dist/formula5.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],
    ["формула сдвига фаз","выглядит","так <br/><a href='images/dist/formula21.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],	
	["схема установки","выглядит","так <br/><embed src='.images/dist/qwe.swf'> </embed>"],
	["катушка индуктивности","- это","катушка смотанного в спираль или другую форму изолированного проводника"],	
    ["катушка индуктивности","выглядит","так <br/><a href='images/dist/formula21.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],	
	["образцовая емкость","- это","емоксть при которой измерительный мост будет уравновешен"],	
    ["схема моста переменного тока","выглядит","так <br/><a href='images/dist/formula7.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],
    ["емкостное сопротивление","- это","проводник, включенный в цепь переменного тока и неимеющий заметного сопротивления и индуктивности, но имеющий заметную емкость С"],
    ["частота переменного тока","- это","число полных изменений ЭДС или число оборотов ради­уса-вектора, то есть иначе говоря, число полных циклов колеба­ний, совершаемых переменным током в течение одной секунды"],
    ["период колебания переменного тока","- это","время, в течение которого совершается одно полное изме­нение ЭДС, то есть один цикл колебания или один полный оборот радиуса-вектора"],
    ["амплитуда переменного тока","- это","наибольшее значение, которого достигает ЭДС или сила тока за один период"],
    ["циклическая частота переменного тока","- это","скорость вращения радиуса-вектора, т. е. изменение ве­личины угла поворота в течение одной секунды"],
    ["сдвиг фаз","- это","разность между начальными фазами двух переменных величин, изменяющихся во времени периодически с одинаковой частотой"],
    ["разность фаз","- это","разность между начальными фазами двух переменных величин, изменяющихся во времени периодически с одинаковой частотой"],
    ["равновесие моста","- это","состояние моста при котором нуль-индикатор показывает ноль"],
    ["электрический ток","- это","направленное движение электрически заряженных частиц под воздействием электрического поля"],
    ["электрическое поле","- это","область вокруг электрического заряда, в которой на каждую заряженную частицу действует некоторая сила"],
	
    ["закон Ома","звучит так:","Сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению"],
    ["резистор","- это","пассивный элемент электрических цепей, который имеет конкретное или переменное значение электрического сопротивления"],
    ["резистор","предназначен","для линейного преобразования силы тока в напряжение и обратно, ограничения тока, поглощения электрической энергии и так далее"],
	
	//магазин емкости
	["магазин емкости","- это","устройство содержащее конденсатор с переменной емкостью"],
	["магазин емкостей","предназначен","для поиска эталонной емкости при балансировке моста"],
	["магазин емкости","выглядит","так <br/><a href='images/dist/chema6.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],

	//нуль-индикатор
	["индикатор равновесия","- это","тоже что и нуль-индикатор."],
	["нуль-индикатор","- это","прибор фиксирующий отсутствие тока в цепях"],
	["гальванометр","- это","высокочувствительный прибор для измерения силы малых постоянных электрических токов, используется например, как нуль-индикатор"],
	["нуль-индикатор","предназначен","фиксирующий отсутствие тока в цепях"],
	["нуль-индикатор","выглядит","так <br/><a href='images/dist/chema8.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],
	
	//конденсаторы
	["конденсатор","- это","элемент цепи состоящий из двух контактов разделенных дилэктриком"],
	["конденсатор","предназначен","для накопления электрического разряда (зарядка) и способный его отдавать (разрядка)"],
	["зарядка конденсатора","- это","процесс накопления конденсатором электрического тока"],
	["разрядка конденсатора","- это","процесс отдачи электрического тока цепи"],
	["конденсатор","выглядит","так <br/><a href='images/dist/chema3.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],
	
	//трансформатор 
	["трансформатор","- это","электромагнитный аппарат, предназначенный для преобразования переменного тока одного напряжения в переменный ток другого напряжения, при той же частоте"],
	["трансформатор","предназначен","для преобразования переменного тока одного напряжение, в переменный ток другого напряжения"],
	["трансформатор","выглядит","так <br/><a href='images/dist/chema2.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],
	
	//реохорд
	["реохорд","- это","прибор для измерения сопротивлений, встречаемых гальваническими токами в местах, по которым он должен проходить"],
	["реохорд","предназначен","для измерения сопротивлений, встречаемых гальваническими токами в местах, по которым он должен проходить"],
	["реохорд","выглядит","так <a href='images/dist/chema4.png' data-fancybox='gallery' ><img src='images/dist/formula1.png' class='formula'> </a>"],
	["подвижный контакт","- это","элемент реохорда"],
	
    //какой сервис предостовляет речь в модуле
    [ "Голосовой сервис Yandex Speechkit" , "иммитирует", "речь в диалоговом модуле" ],
];

//поиск и вывод ответа и вопроса
function ask(questionInput){
	var question=document.getElementById(questionInput).value.trim();
	//выдвижение диалогового модуля
	$("#dialog").animate({"margin-left":"-400px"}, 1000, function() {});
	dialogOn=true;
	//вывод вопроса
	//document.getElementById("history").innerHTML+="<div class='question'>"+question+"</div>";
	var newDiv=document.createElement("div");
	newDiv.className='question';
	newDiv.innerHTML=question;
	document.getElementById("history").appendChild(newDiv);
	//поиск и вывод ответа
	//document.getElementById("history").innerHTML+="<div class='answer'>"+getAnswer(question)+"</div>";
	//создаем блок <div>
	newDiv=document.createElement("div");
	//задаем класс оформления созданного блока
	newDiv.className='answer';
	//получаем ответ на вопрос и наполняем им созданный блок
	newDiv.innerHTML=getAnswer(question);
	//ОЗВУЧКА - СИНТЕЗ РЕЧИ
	//флаг, нужна ли озвучка (не нужна, если есть анимация)
	var needSound=true;
	//проходим по элементам HTML-кода ответа
	for(var i=0;i<newDiv.childNodes.length;i++){
		//если находим элемент <embed>
		if(newDiv.childNodes[i].tagName=="EMBED"){
			//alert("EMBED detected.");
			//сбрасываем флаг и выходим из цикла
			needSound=false;
			break;
		}
	}
	//если флаг не был сброшен
	if(needSound){
		//добавляем в ответ тег аудио, ссылающийся на звук от синтезатора речи яндекса
		//в обращении к яндексу tts.voicetech.yandex.net указывается:
		// - формат звука: format=wav
		// - язык озвучиваемого текста: lang=ru-RU
		// - ключ, полученный при регистрации в личном кабинете для SpeechKit Cloud API: key=4a4d3a13-d206-45fc-b8fb-e5a562c9f587
		// - озвучиваемый текст, который берется из сгенерированного ответа: text="+newDiv.innerText+"
		//alert("Incoming transmission.");
		newDiv.innerHTML+="<audio controls='true' autoplay='true' src='http://tts.voicetech.yandex.net/generate?format=wav&lang=ru-RU&key=4a4d3a13-d206-45fc-b8fb-e5a562c9f587&text="+(newDiv.innerText||newDiv.textContent)+"'></audio>";
	}
	// КОНЕЦ ОЗВУЧКИ
	document.getElementById("history").appendChild(newDiv);
	// ЕЩЕ КУСОЧЕК ДЛЯ ОЗВУЧКИ
	//запуск звука
	if(newDiv.lastChild.tagName=="AUDIO"){
		newDiv.lastChild.play();
	}
	//прокрутка истории в самый низ
	document.getElementById("history").scrollTop = document.getElementById("history").scrollHeight;
	//очистка текстового поля для ввода вопроса
	document.getElementById(questionInput).value="";
}

//псевдоокончания сказуемых (глаголов, кратких причастий и прилагательных )
var endings = [ ["ет","(ет|ут|ют)"], ["ут","(ет|ут|ют)"], ["ют","(ет|ут|ют)"],																										//1 спряжение
        			["ит","(ит|ат|ят)"], ["ат","(ит|ат|ят)"], ["ят","(ит|ат|ят)"],																											//2 спряжение
        			["ется","(ет|ут|ют)ся"], ["утся","(ет|ут|ют)ся"], ["ются","(ет|ут|ют)ся"],																					//1 спряжение, возвратные
        			["ится","(ит|ат|ят)ся"], ["атся","(ит|ат|ят)ся"], ["ятся","(ит|ат|ят)ся"],																					//2 спряжение, возвратные
        			["ен","ен"], ["ена","ена"], ["ено","ено"], ["ены","ены"],	["ан","ан"], ["ана","ана"], ["ано","ано"], ["аны","аны"], //краткие прилагательные
        			["жен","жен"], ["жна","жна"], ["жно","жно"], ["жны","жны"],																													//краткие прилагательные
							["такое","- это"]];																																																	//для вопроса "что такое А?" ответ - "А - это ..."
//черный список слов, распознаваемых как сказуемые по ошибке
var blacklist = [ "замена", "замены", "атрибут", "маршрут", "член", "нет" ];
//функция определения сказуемых по соответствующим псевдоокончаниям
function getEnding(word)
{
  //проверка по черному списку
  if (blacklist.indexOf(word)!==-1) return -1;
  //перебор псевдоокончаний
  for (var j = 0; j < endings.length; j++)
  {
    //проверка, оканчивается ли i-ое слово на j-ое псевдоокончание
    if(word.substring(word.length-endings[j][0].length)==endings[j][0]){
        return j;   //возврат номера псевдоокончания
    }
  }
  return -1;  //если совпадений нет - возврат -1
}

//функция, которая делает первую букву маленькой
function small1(str)
{
  return str.substring(0, 1).toLowerCase() + str.substring(1);
}

//функция, которая делает первую букву большой
function big1(str)
{
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

//главная функция, обрабатывающая запросы клиентов
function getAnswer(question)
{
  //знаки препинания
  var separators = "'\",.!?()[]\\/";
  //получение текста из параметра запроса
  var txt = small1(question);
  //добавление пробелов перед знаками препинания
  for (var i = 0; i < separators.length; i++)
     txt = txt.replace(separators[i], " " + separators[i]);
  //массив слов и знаков препинания
  var words = txt.split(' ');
  //флаг, найден ли ответ
  var result = false;
  //формируемый функцией ответ на вопрос
  var answer = "";
  //перебор слов
  for (var i = 0; i < words.length; i++)
  {
		//alert(words[i]);
    //поиск номера псевдоокончания
    var ending = getEnding(words[i]);
    //если псевдоокончание найдено – это сказуемое, подлежащее в вопросе после него
    if (ending >= 0)
    {
			//---ТОЧНЫЙ ПОИСК---
			//---ПОИСК С ПОМОЩЬЮ РЕГУЛЯРНЫХ ВЫРАЖЕНИЙ---
	    //замена псевдоокончания на набор возможных окончаний
	    words[i] = words[i].substring(0, words[i].length - endings[ending][0].length) + endings[ending][1];
	    //создание регулярного выражения для поиска по сказуемому из вопроса
	    var predicate = new RegExp(words[i]);
	    //для кратких прилагательных захватываем следующее слово
	    if (endings[ending][0] == endings[ending][1])
	    {
	      predicate = new RegExp(words[i] + " " + words[i + 1]);
	      i++;
	    }
			var subject_array = words.slice(i + 1);
			var subject_text = subject_array.join(" ");
	    //создание регулярного выражения для поиска по подлежащему из вопроса
			//из слов подлежащего выбрасываем короткие предлоги (периметр у квадрата = периметр квадрата)
			for (var j = 0; j < subject_array.length; j++){
				if(subject_array[j].length < 3){
					subject_array.splice(j);
					j--;
				}
			}
			var subject_string = subject_array.join(".*");
			//только если в послежащем больше трех символов
			if (subject_string.length>3)
			{
				var subject = new RegExp(".*" + subject_string + ".*");
				//поиск совпадений с шаблонами среди связей семантической сети
				for (var j = 0; j < knowledge.length; j++)
				{
					if (predicate.test(knowledge[j][1]) && (subject.test(knowledge[j][0]) || subject.test(knowledge[j][2])))
					{
						//создание простого предложения из семантической связи
						answer+=big1(knowledge[j][0] + " " + knowledge[j][1] + " " + knowledge[j][2] + ". ");
						result = true;
					}
				}
				//если совпадений с двумя шаблонами нет,
				if (result == false){
					//поиск совпадений только с шаблоном подлежащего
					for (var j = 0; j < knowledge.length; j++)
					{
						if ((subject.test(knowledge[j][0]) || subject.test(knowledge[j][2])))
						{
							//создание простого предложения из семантической связи
							answer+=big1(knowledge[j][0] + " " + knowledge[j][1] + " " + knowledge[j][2] + ". ");
							result = true;
						}
					}
				}
			}
  	}
  }
  //если ответа нет
  if(!result)
  	answer = "Ответ не найден. <br/>";
		//если ответ есть - добавляем увеличение картинок
	else
		answer = answer.replace("<img ", "<img onclick='zoom(this.src)'");
    return answer;
}

function zoom(src){
	document.getElementById("img_in_alert").src=src;
	$("#imgalert").css({"display":"block"});
	clearInterval(timer);
}
