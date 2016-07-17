/**
 * Created by user on 15.07.16.
 */
'use strict';
var $ = require('jquery');
$(function () {
    window.Rezume = new Rezume({
        id:1
    });
    console.log(window.Rezume);
});
var Settings = {

};

/**
 * Rezume object
 * @constructor
 */
var Rezume = function(options){
     var defaults = {
        RezumeElems: {
            zn: ', ',
            user_img: '#user_img',
            user_name: '#user_name',
            user_description: '#user_description',
            user_contacts: '#user_contacts',
            user_other: '#user_other',
            user_wish: '#wish',
            languages: '#languages',
            skills_elems: '#skills_elems',
            expirianse_lenght: '#expirianse_length'
        }
    };
    //var domen = location.href;
    var path = 'assets/files/data.json';
    var $this = this;

    this.getData = function(id){
        /**
         * params for json
         * @type {{id: *}}
         */
        var  params = {
            id:this.id
        };
        $.ajax({
            url: path,
            dataType: 'json',
            cache: false,
            data:  params,
            success: function(data) {
                console.log(data);
                console.log(isError(data));
                if(!isError(data)){
                    $this.getHeader(data);
                    $this.getContent(data);
                }
            },
            complete: function (XMLHttpRequest, textStatus) {
                console.log('complete');
            },
            error: function(xhr, status, err) {
                console.log(err);
            }
        }).always(function () {
            console.log('always');
        });

    };
    this.getHeader = function(data){
        var i = 0,
            descriptionLength = 0;
        var user = data.user;
        var name = user.name;
        var img = user.img.src;
        var description = user.description;
        var contacts = user.contact;
        var other = user.other;
        $(options.RezumeElems.user_img).find('img').attr({src:img, title:name, alt:name});
        $(options.RezumeElems.user_name).html(name);
        for ( name in description ) {
            descriptionLength++;
        }
        $.each(description, function(key, val){
            i++;
            if(i == descriptionLength){
                options.RezumeElems.zn = '';
            }
            if(key == 'age'){
                val += ' лет';
            }
            if(key == 'born'){
                val = 'родилась ' + val;
            }
            $(options.RezumeElems.user_description).append(val + options.RezumeElems.zn);
        });

        $(options.RezumeElems.user_contacts).append($('<ul>'));
        $.each(contacts, function(key, val){
            if(key == 'tel'){
                val += val + ' - <span class="light-grey">предпочитаемый способ связи</span>';
            }
            if(key == 'icq'){
                val = 'ICQ: ' + val;
            }
            if(key == 'skype'){
                val = 'Skype: ' + val;
            }
            $(options.RezumeElems.user_contacts).find('ul').append($('<li>').append(val));
        });
        $(options.RezumeElems.user_other).append($('<ul>'));
        $.each(other, function(key, val){
            if(key == 'city'){
                val = 'Проживает: ' + val;
            }
            if(key == 'gr'){
                val = 'Гражданство: ' + val;
            }

            $(options.RezumeElems.user_other).find('ul').append($('<li>').append(val));
        });
    };
    this.getContent = function(data){
        $this.getWishes(data);
        $this.getExpiriense(data);
        $this.getExpiriense(data);
        $this.getEducation(data);
        $this.getCourses(data);
        $this.getSkills(data);
    };
    this.getWishes = function(data){
        var wishes = data.user.wishes;
        var post_name = wishes.post_name;
        var description = wishes.description;
        $(options.RezumeElems.user_wish).find('.content .name').html(post_name);
        $.each(description, function(key, val){
            if(key == 'time'){
                val = 'Занятость: ' + val;
            }
            if(key == 'shadule'){
                val = 'График работы ' + val;
            }
            if(key == 'time_to_job'){
                val = 'Желательное время в пути до работы: ' + val;
            }
            $(options.RezumeElems.user_wish).find('.content .description')
                .append($('<div>').attr({class:'category-name'})
                    .append(val));
        });


    };
    this.getExpiriense = function(data){
        $(options.RezumeElems.expirianse_lenght).html(data.user.expirianse_length);

    };
    this.getEducation = function(data){

    };
    this.getCourses = function(data){

    };
    this.getSkills = function(data){
        var languages = data.user.skills.languages;
        var elems = data.user.skills.elems;
        $(options.RezumeElems.languages)
            .append($('<div>').attr({class:'name-column'})
                .append('Знание языков'))
            .append($('<div>').attr({class:'content-column'})
                .append($('<ul>')));
        $(options.RezumeElems.skills_elems)
            .append($('<div>').attr({class:'name-column'})
                .append('Навыки'))
            .append($('<div>').attr({class:'content-column'})
                .append($('<ul>')));
        $.each(languages, function(key, val){
            val = val.name + ' - ' + '<span class="light-grey">' + val.description + '</span>';
            $(options.RezumeElems.languages).find('.content-column ul').append($('<li>').append(val));
        });
        $.each(elems, function(key, val){
            $(options.RezumeElems.skills_elems).find('.content-column ul').append($('<li>').append(val));
        });
    };
    /**
     * show error ( validate)
     * @param obj
     * @param txt
     */
    this.showError = function(obj, txt){
        obj.find('.modal-footer .modal-error').text(txt);
    };
    this.applyOptions = function() {
        var def;
        console.log(defaults);
        options = options || {};
        for (def in defaults) {
            if (typeof options[def] === 'undefined') {
                options[def] = defaults[def];
            }
        }
        console.log(options);
    };
    $this.applyOptions();
    $this.getData(this.id);
};
function isError(replay){
    return (replay.error != null);
}
