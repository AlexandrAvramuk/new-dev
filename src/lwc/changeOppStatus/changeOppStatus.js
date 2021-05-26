import {LightningElement, wire, track, api} from 'lwc';
import {getRecord} from 'lightning/uiRecordApi';

import updateStagesOpp
    from '@salesforce/apex/ControllerChangeOppStatus.updateStagesOpp';
import {ShowToastEvent} from 'lightning/platformShowToastEvent'
import {updateRecord, getRecordUi} from 'lightning/uiRecordApi';
import {getPicklistValuesByRecordType} from 'lightning/uiObjectInfoApi';


import getPicklistsValueStages
    from '@salesforce/apex/ControllerChangeOppStatus.getPicklistsValueStages';
import ApiName from '@salesforce/schema/OpportunityStage.ApiName';
import IsClosed from '@salesforce/schema/OpportunityStage.IsClosed';
import SortOrder from '@salesforce/schema/OpportunityStage.SortOrder';
import Id from '@salesforce/schema/OpportunityStage.Id';

const FIELDS = ['Opportunity.StageName'];

export default class ChangeOppStatus extends LightningElement {

    // current object api name
    @api objectApiName;

    // иконка кнопки для развертывания под каждым стейджем разную информацию
    @track iconButtonShowMore = 'utility:chevronright';

    // иконка кнопки для маркировки статуса
    @track StyleButtonCheck = 'utility:check';

    // bool переменна по каторой меняется иконка в кнопке iconButtonShowMore
    @track boolAddChangeIcon = false;

    // bool для открытия попапа
    @track openModelWithDataField = false;

    // лист статусов для закрытия Opportunity
    @track listPicklistStageClosed = [];

    // лист всех статусов
    @track mainPicklistOpenAndClosed = [];

    // лист всех статусов и стили для них
    @track objectStagesForStyle = [];

    // статус текущего Opportunity со страници
    @track stageFromRecordOpp = '';

    // измененный статус Opportunity
    @track statusOpportunity = '';

    // Id данного Opportunity
    @api recordId;

    // содержит название кнопки в зависимости от статуса и действия
    @track labelButtonForStatus = '';

    // делает активнную или не активную кнопку
    @track disabledButtonShowMore = true;

    // булив которая от которой зависит будет ли видна инфорцация для данного статуса
    @track stageInitialOutreach = false;

    // булив которая от которой зависит будет ли видна инфорцация для данного статуса
    @track stageProposal = false;

    // булив которая от которой зависит будет ли видна инфорцация для данного статуса
    @track stageContractingProcurement = false;

    // булив которая от которой зависит будет ли видна инфорцация для данного статуса
    @track stageClosedLost = false;

    // ScoreOrder текуцего статуса
    @track currentOrder = 0;

    // ScoreOrder активного статуса
    @track actionOrder = 0;

    @track loaded = false;

    // current object metadata info
    @track objectInfo;

    // current record's record type id
    _recordTypeId;


    // available picklist values for current record (based on record type)
    @track possibleSteps;

    /**  метод для смены иконки на кнопке **/
    handlerOpenText() {
        this.boolAddChangeIcon = !this.boolAddChangeIcon;
        this.iconButtonShowMore = this.boolAddChangeIcon ? 'utility:chevrondown' : 'utility:chevronright';
        this.handlerChangeText();
    }

    /**  метод для показа доп информации для каждого статуса **/
    handlerChangeText() {
        let thisTemplate = this.template.querySelector('.slds_path_content');
        if (this.boolAddChangeIcon) {
            thisTemplate.classList.remove('slds-is-collapsed');
            thisTemplate.classList.add('slds-is-expanded');
        } else {
            thisTemplate.classList.remove('slds-is-expanded');
            thisTemplate.classList.add('slds-is-collapsed');
        }
    }

    /** метод тянет текущий Stage со страници по Id его  **/
    @wire(getRecord, {recordId: '$recordId', fields: FIELDS})
    wiredAccount({error, data}) {
        if (data) {
            this.stageFromRecordOpp = data.fields.StageName.value;
            this.statusOpportunity = data.fields.StageName.value;
            if (this.stageFromRecordOpp != undefined) {
                this.checkWhichStage(this.stageFromRecordOpp)
                this.renderedCallback();
            }
        } else if (error) {
            this.error = error;
        }
    }

    /** метод который в заависимости от стаутса показывает доп информацию или нет  **/
    checkWhichStage(stage) {
        switch (stage) {
            case 'Initial Outreach':
                this.stageInitialOutreach = true;
                this.stageProposal = false;
                this.stageContractingProcurement = false;
                this.stageClosedLost = false;
                this.disabledButtonShowMore = false;
                break;
            case 'Proposal':
                this.stageProposal = true;
                this.stageInitialOutreach = false;
                this.stageContractingProcurement = false;
                this.stageClosedLost = false;
                this.disabledButtonShowMore = false;
                break;
            case 'Contracting/Procurement':
                this.stageContractingProcurement = true;
                this.stageProposal = false;
                this.stageInitialOutreach = false;
                this.stageClosedLost = false;
                this.disabledButtonShowMore = false;
                break;
            case 'Closed Lost':
                this.stageClosedLost = true;
                this.stageProposal = false;
                this.stageInitialOutreach = false;
                this.stageContractingProcurement = false;
                this.disabledButtonShowMore = false;
                break;
            default:
                this.stageInitialOutreach = false;
                this.stageProposal = false;
                this.stageContractingProcurement = false;
                this.stageClosedLost = false;
                this.disabledButtonShowMore = true;
                break;
        }
    }

    @wire(getRecordUi, {
        recordIds: '$recordId',
        layoutTypes: 'Full',
        modes: 'View'
    })
    wiredRecordUI({error, data}) {
        if (error) {
            this.errorMsg = error.body.message;
        }

        if (data && data.records[this.recordId]) {
            // set the record
            this.record = data.records[this.recordId];

            // set the object info
            this.objectInfo = data.objectInfos[this.objectApiName];

            // set the current record type
            const rtId = this.getRecordTypeId(this.record);
            this._recordTypeId = rtId
                ? rtId
                : this.getMasterRecordTypeId(this.objectInfo);
        }
    }

    getMasterRecordTypeId(objectInfo) {
        if (objectInfo.recordTypeInfos) {
            for (let rtId in objectInfo.recordTypeInfos) {
                if (objectInfo.recordTypeInfos[rtId].master) {
                    return objectInfo.recordTypeInfos[rtId].recordTypeId;
                }
            }
        }
        return null;
    }

    getRecordTypeId(record) {
        if (record.recordTypeInfo) {
            return record.recordTypeInfo.recordTypeId;
        }
        return null;
    }

    // load picklist values available for current record type
    @wire(getPicklistValuesByRecordType, {
        objectApiName: '$objectApiName',
        recordTypeId: '$_recordTypeId'
    })
    wiredPicklistValues({error, data}) {
        if (!this._recordTypeId) {
            // invalid call
            return;
        }

        if (error) {
            this.errorMsg = error.body.message;
        }

        if (data) {
            if (data.picklistFieldValues['StageName']) {
                for (let item in data.picklistFieldValues['StageName'].values) {
                    let val = data.picklistFieldValues['StageName'].values[item]
                    let obj = {};
                    obj.label = val.value;
                    obj.value = val.value;
                    obj.id = val.value;
                    obj.id_a = val.value;
                    obj.id_li = val.value;
                    obj.id_span = val.value;
                    obj.sortOrder = item;
                    obj.isClosed = val.attributes.closed;

                    if (val.attributes.closed) {
                        this.listPicklistStageClosed.push(obj);
                    } else {
                        this.mainPicklistOpenAndClosed.push(obj);
                    }
                }

                this.mainPicklistOpenAndClosed.push({
                    label: 'Closed',
                    value: 'Closed',
                    id: 'Closed',
                    id_a: 'Closed',
                    id_li: 'Closed',
                    id_span: 'Closed',
                    sortOrder: this.mainPicklistOpenAndClosed.length + 1,
                    isClosed: true
                });

                this.error = undefined;
            } else if (data.error) {
                this.error = data.error;
                this.mainPicklistOpenAndClosed = undefined;

            }
        }
    }

    // /**  метод для сбора пиклистов StageName  **/
    // @wire(getPicklistsValueStages)
    // wiredGetPicklistStages(result) {
    //     if (result.data) {
    //         result.data.forEach(item => {
    //             let obj = {};
    //             obj.label = item[ApiName.fieldApiName];
    //             obj.value = item[ApiName.fieldApiName];
    //             obj.id = item[Id.fieldApiName];
    //             obj.id_a = item[Id.fieldApiName];
    //             obj.id_li = item[Id.fieldApiName];
    //             obj.id_span = item[Id.fieldApiName];
    //             obj.sortOrder = item[SortOrder.fieldApiName];
    //             obj.isClosed = item[IsClosed.fieldApiName] ? true : false;
    //
    //             if (item[IsClosed.fieldApiName]) {
    //                 this.listPicklistStageClosed.push(obj);
    //             } else {
    //                 this.mainPicklistOpenAndClosed.push(obj);
    //             }
    //
    //         });
    //
    //         this.mainPicklistOpenAndClosed.push({
    //             label: 'Closed',
    //             value: 'Closed',
    //             id: 'Closed',
    //             id_a: 'Closed',
    //             id_li: 'Closed',
    //             id_span: 'Closed',
    //             sortOrder: this.mainPicklistOpenAndClosed.length + 1,
    //             isClosed: true
    //         });
    //
    //         this.error = undefined;
    //     } else if (result.error) {
    //         this.error = result.error;
    //         this.mainPicklistOpenAndClosed = undefined;
    //
    //     }
    //     // console.log('mainPicklistOpenAndClosed :: ' ,this.mainPicklistOpenAndClosed)
    // }

    /** метод который по Id-стейджа меняет статус Opp  **/
    setId(event) {
        if (this.mainPicklistOpenAndClosed != undefined && this.stageFromRecordOpp != undefined) {
            this.mainPicklistOpenAndClosed.forEach(item => {
                this.actionOrder = event.target.id.includes(item.id) ? item.sortOrder : this.actionOrder;
                this.statusOpportunity = event.target.id.includes(item.id) ? item.value : this.statusOpportunity;
            });
            this.checkWhichStage(this.statusOpportunity);
        }
        this.changeNameButton();
        this.fillingObjectForStagesStyle(this.currentOrder, this.actionOrder);
        this.fillingInStyles();
    }

    /** метод для изменения имени кнопки для открытия попапа или смены статуса  **/
    changeNameButton() {
        if (this.statusOpportunity == 'Deferred' || this.statusOpportunity == 'Closed Won' || this.statusOpportunity == 'Closed Lost') {
            this.StyleButtonCheck = '';
            this.labelButtonForStatus = 'Change Closed Stage';
        } else if (this.statusOpportunity == 'Closed') {
            this.labelButtonForStatus = 'Select Closed Stage';
            this.StyleButtonCheck = '';
        } else {
            this.labelButtonForStatus = this.statusOpportunity == this.stageFromRecordOpp ? ' Mark Status as Complete' : 'Mark as Current Stage';
            this.StyleButtonCheck = this.statusOpportunity == this.stageFromRecordOpp ? 'utility:check' : '';
        }
    }

    /**  метод который меняет статус или открывает попап если это закрывающий статус Opp  **/
    openModelWithData() {
        let bool1 = this.statusOpportunity == 'Closed' || this.statusOpportunity == 'Deferred' ||
            this.statusOpportunity == 'Closed Won' || this.statusOpportunity == 'Closed Lost' ||
            this.statusOpportunity == 'Proposal';
        if (bool1) {
            // если статус один из закрывающих то открывается попап
            this.openModelWithDataField = true;
            this.checkWhichStage(this.statusOpportunity)
        } else {
            // иначе логика работает в зависимостит от текущего ордера и активного ордера
            if (this.actionOrder == this.currentOrder) {
                // если текущий ордер и активный ордер равны значит была нажата кнопка след статус. Добавляем по единице и определяем след статус
                this.currentOrder++;
                this.actionOrder++;
                this.mainPicklistOpenAndClosed.forEach(item => {
                    this.statusOpportunity = item.sortOrder == this.currentOrder ? item.value : this.statusOpportunity;
                });
                if (this.statusOpportunity == 'Closed' || this.statusOpportunity == 'Proposal') {
                    // если стал статус закрывающий то открываем попап
                    this.openModelWithDataField = true;
                } else {
                    // иначе просто меняем стили и сохраняем стейдж
                    this.fillingObjectForStagesStyle(this.currentOrder, this.actionOrder);
                    this.fillingInStyles();
                    let obj = {
                        Id: this.recordId,
                        StageName: this.statusOpportunity
                    };
                    this.handleSaveStageOpp(obj);
                    this.loaded = true;
                }

            } else {
                // иначе был нажат любой статус и по этому активному ордеру бы накидываем стили и сохраняем стейдж
                this.fillingObjectForStagesStyle(this.actionOrder, this.actionOrder);
                this.fillingInStyles();
                this.currentOrder = this.actionOrder;
                let obj = {
                    Id: this.recordId,
                    StageName: this.statusOpportunity
                };
                this.handleSaveStageOpp(obj);
                this.loaded = true;
            }
        }
    }

    /**  метод для обновления Opp через apex   **/
    handleSaveStageOpp(obj) {
        updateStagesOpp({obj: JSON.stringify(obj)})
            .then(result => {
                const fields = obj;
                const recordInput = {fields};
                updateRecord(recordInput)
                    .then(() => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: 'Stage changed successfully.',
                                variant: 'success',
                            }),
                        );
                        this.loaded = false;
                    })
                    .catch(error => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Updating error',
                                message: error.body.message,
                                variant: 'error',
                            }),
                        );
                        this.loaded = false;
                    });

            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Updating error',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
                this.loaded = false;
            });
    }

    /** метод для закрытия попапа  **/
    handleCloseModalWithData() {
        this.openModelWithDataField = false;
    }

    /** метод для сохранения  **/
    handleSaveMethodWithData() {
        this.handleCloseModalWithData();
    }

    /** метод тянет данные борды для редактирования  **/
    renderedCallback() {
        this.changeNameButton();
        this.handlerChangeText();
        if (this.mainPicklistOpenAndClosed != undefined && this.stageFromRecordOpp != undefined) {
            this.mainPicklistOpenAndClosed.forEach(item => {
                let boolCheckStatusClosed = item.label == 'Closed' || item.label == 'Closed Lost' || item.label == 'Closed Won' || item.label == 'Deferred';
                if (this.stageFromRecordOpp == 'Deferred' || this.stageFromRecordOpp == 'Closed Won' || this.stageFromRecordOpp == 'Closed Lost') {
                    item.label = boolCheckStatusClosed ? this.stageFromRecordOpp : item.label;
                    item.value = boolCheckStatusClosed ? this.stageFromRecordOpp : item.value;
                } else {
                    item.label = boolCheckStatusClosed ? 'Closed' : item.label;
                    item.value = boolCheckStatusClosed ? 'Closed' : item.value;
                }
                this.currentOrder = item.value == this.stageFromRecordOpp ? item.sortOrder : this.currentOrder;
            });
            this.actionOrder = this.currentOrder;
            this.fillingObjectForStagesStyle(this.currentOrder, this.actionOrder);
            this.fillingInStyles();
        }
    }

    /** метод заполняет данные для для дальнейшей прорисовки стилей для всех статусов  **/
    fillingObjectForStagesStyle(currentOrder, actionOrder) {
        this.objectStagesForStyle = [];
        this.mainPicklistOpenAndClosed.forEach(item => {
            let obj = {};
            obj.idStage = item.id;
            obj.stageName = item.value;
            obj.sortOrder = item.sortOrder;
            obj.isWon = item.isClosed && currentOrder >= item.sortOrder ? true : false; //если статус из закрывающих И ордер текуцего статуса больше ли равно чем ордер другова статуса отсчитывая по порядку
            obj.isComplete = currentOrder > item.sortOrder ? true : false;              //если ордер текуцего статуса больше чем ордер другова статуса отсчитывая по порядку
            obj.isCurrent = currentOrder == item.sortOrder ? true : false;              //если ордер текуцего статуса равно ордеру другова статуса отсчитывая по порядку
            obj.isAction = actionOrder == item.sortOrder ? true : false;                //если ордер активного статуса равно ордеру другова статуса отсчитывая по порядку
            if (obj.isWon) {
                obj.isAction = true;
            }
            obj.isIncomplete = currentOrder < item.sortOrder ? true : false;            //  если ордер текущего статуса меньше чем ордер другова статуса отсчитывая по порядку
            this.objectStagesForStyle.push(obj);
        });

    }

    /** метод распределяет стили для кажлого стейжда  **/
    fillingInStyles() {
        let thisTemplate = this.template.querySelectorAll('.stage-for-template');
        for (let i = 0; i < thisTemplate.length; i++) {
            const item = thisTemplate[i];
            item.classList.remove('slds-is-incomplete', 'slds-is-current', 'slds-is-active', 'slds-is-complete', 'slds-is-won');
            for (let i in this.objectStagesForStyle) {
                let bool = item.id.includes(this.objectStagesForStyle[i].idStage);
                if (bool && this.objectStagesForStyle[i].isComplete && !this.objectStagesForStyle[i].isWon) {
                    item.classList.add('slds-is-complete');
                }
                if (bool && this.objectStagesForStyle[i].isCurrent) {
                    item.classList.add('slds-is-current');
                }
                if (bool && this.objectStagesForStyle[i].isAction) {
                    item.classList.add('slds-is-active');
                }
                if (bool && this.objectStagesForStyle[i].isIncomplete) {
                    item.classList.add('slds-is-incomplete');
                }
                if (bool && this.objectStagesForStyle[i].isWon) {
                    item.classList.add('slds-is-won');
                }
            }
        }
    }

    /** метод с попапа который дает инфу по изменению статуса и полей которые надо заполнить для данного статутса  **/
    sendClosedStage(event) {
        let obj = event.detail;
        if (obj.StageName != 'Proposal') {
            this.mainPicklistOpenAndClosed.forEach(item => {
                let boolCheckStatusClosed = item.label == 'Closed' || item.label == 'Closed Lost' || item.label == 'Closed Won' || item.label == 'Deferred';
                item.label = boolCheckStatusClosed ? obj.StageName : item.label;
                item.value = boolCheckStatusClosed ? obj.StageName : item.value;
                this.stageFromRecordOpp = obj.StageName;
            });
        }

        delete obj.sortOrder;
        this.fillingObjectForStagesStyle(this.currentOrder, this.actionOrder);
        this.fillingInStyles();
        obj.Id = this.recordId;
        this.handleSaveStageOpp(obj);
        this.loaded = true;

    }

    /** магия с шириной кнопки  **/
    sheet;

    connectedCallback() {
        this.sheet = document.createElement('style');
        this.sheet.innerHTML = ".widthAuto .slds-button.slds-button_brand {width: 100% !important;}";
        document.body.appendChild(this.sheet);
    }

    disconnectedCallback() {
        document.body.removeChild(this.sheet);
    }

}