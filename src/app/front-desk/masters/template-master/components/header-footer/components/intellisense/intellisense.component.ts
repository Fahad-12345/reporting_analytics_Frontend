import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { LayoutService } from '../../services/layout.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { SubjectService } from '../../services/subject.service';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { DomSanitizer } from '@angular/platform-browser';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-intellisense',
  templateUrl: './intellisense.component.html',
  styleUrls: ['./intellisense.component.scss']
})
export class IntellisenseComponent implements OnInit {
  object: any = {};
  options: any = []
  data: any = [];
  editText: any = false;
  boundStatement: any = "";
  paraClickCheck = false;
  searchData: any = [];
  selectedOptions = [];
  constructor(public layoutService: LayoutService, public subject: SubjectService, protected requestService: RequestService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    // if (this.layoutService.editorView && this.object.preDefind) {
    if (this.object.preDefind) {
      if (this.object.preDefinedObj.slug == 'hcpcs_codes') {
        this.requestService
          .sendRequest(
            TemaplateManagerUrlsEnum.hcpcs_codes,
            'GET',
            REQUEST_SERVERS.billing_api_url,
          ).subscribe(
            (response: HttpSuccessResponse) => {
              this.data = response.result.data;
              this.searchData = response.result.data;
            });
      } else if (this.object.preDefinedObj.slug == 'cpt_codes') {
        this.requestService
          .sendRequest(
            TemaplateManagerUrlsEnum.cpt_codes,
            'GET',
            REQUEST_SERVERS.billing_api_url,
          ).subscribe(
            (response: HttpSuccessResponse) => {
              this.data = response.result.data;
              this.searchData = response.result.data;
            });
      } else if (this.object.preDefinedObj.slug == 'icd_10_codes') {
        this.requestService
          .sendRequest(
            TemaplateManagerUrlsEnum.icd_10_codes,
            'GET',
            REQUEST_SERVERS.billing_api_url,
          ).subscribe(
            (response: HttpSuccessResponse) => {
              this.data = response.result.data;
              this.searchData = response.result.data;
            });
      }
      let tempData = [];
      let checkFlag = true;
      for (let item of this.data) {
        for (let selectedItem of this.object.options) {
          if (item.id == selectedItem.id) {
            checkFlag = false;
          }
        }
        if (checkFlag) {
          tempData.push(item);
        }
      }
      this.data = tempData;
      this.searchData = tempData;
    }
    this.boundStatement = this.object.statement;
  }
  searchCodes(event) {
    this.searchData = [];
    let nameFlag = 0;
    let descriptionFlag = 0;
    event.target.value = event.target.value.toLowerCase();
    let words = event.target.value.split(' ');

    for (let i = 0; i < this.data.length; i++) {
      let tempName = this.data[i].name.toLowerCase();
      let tempDescription = this.data[i].description.toLowerCase();
      for (let j = 0; j < words.length; j++) {
        if (tempName.includes(words[j]) && nameFlag != -1) {
          nameFlag = 1;
          tempName = tempName.replace(words[j], '');
        } else {
          nameFlag = -1;
        }
        if (tempDescription.includes(words[j]) && descriptionFlag != -1) {
          descriptionFlag = 1;
          tempDescription = tempDescription.replace(words[j], '');
        } else {
          descriptionFlag = -1;
        }
      }
      if (nameFlag == 1 || descriptionFlag == 1) {
        this.searchData.push(this.data[i]);
      }
      nameFlag = 0;
      descriptionFlag = 0;
    }

  }


  searchOptions(event) {
    document.getElementById("intellisenseSearch2").focus();
    this.searchData = [];
    this.data = [];
    let nameFlag = 0;
    let words = event.target.value.split(' ');
    for (let i = 0; i < this.object.options.length; i++) {
      if (!this.object.options[i].selected) {
        this.data.push(this.object.options[i]);
      }
    }
    for (let i = 0; i < this.data.length; i++) {
      let tempName = this.data[i].label || this.data[i].name;
      for (let j = 0; j < words.length; j++) {
        if (tempName.includes(words[j]) && nameFlag != -1) {
          nameFlag = 1;
          tempName = tempName.replace(words[j], '');
        } else {
          nameFlag = -1;
        }
      }
      if (nameFlag == 1) {
        this.searchData.push(this.data[i]);
      }
      nameFlag = 0;
    }

  }

  selectCode(item) {
    item.selected = true;
    this.options.push(item)
    let tempData = [];
    for (let searchItem of this.searchData) {
      if (searchItem.id != item.id) {
        tempData.push(searchItem);
      }
    }
    this.searchData = tempData;
    tempData = [];
    for (let tempItem of this.data) {
      if (tempItem.id != item.id) {
        tempData.push(tempItem);
      }
    }
    this.data = tempData;
    this.object.options.push(item);
    let tempItem = cloneDeep(item)
    let objId = '';
    for (let i = 0; i < this.layoutService.section.length; i++) {
      for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {

        if (this.layoutService.section.dashboard[j].obj.type == "intellisense" &&
          this.layoutService.section.dashboard[j].obj.uicomponent_name === this.object.uicomponent_name) {
          objId = this.layoutService.section.dashboard[j].id
          break;
        }
      }
    }
      for (let r = 0; r < this.layoutService.section.dashboard.length; r++) {
        if (this.layoutService.section.dashboard[r].obj.uicomponent_name == this.object.uicomponent_name) {
            }
        if (this.layoutService.section.dashboard[r].obj.MultiSelectObj && this.layoutService.section.dashboard[r].obj.MultiSelectObj.objectid == objId) {
          if (this.object.preDefind) {
            tempItem.label = tempItem.name + ' - ' + tempItem.description;
          }
          let tempItem2 = cloneDeep(tempItem);
          if (this.object.preDefind) {
            delete tempItem2.name;
            delete tempItem2.description;
          }
          this.layoutService.section.dashboard[r].obj.options.push(tempItem2)

          for (let d = this.layoutService.section.dashboard[r].obj.options.length - 1; d >= 0; d--) {
            let vari = 0
            for (let e = 0; e < this.options.length; e++) {

              if (this.layoutService.section.dashboard[r].obj.options[d].id == this.options[e].id)
                this.layoutService.section.dashboard[r].obj.options[d].selected = false
              vari++
            }
            if (vari == 0)
              this.layoutService.section.dashboard[r].obj.options.splice(d, 1);
          }
        }
      }

    this.subject.instanceRefreshCheck('tick');
    // this.optionSelect(item);
  }

  selectOption(item) {
    item.selected = true;
    this.options.push(item)
    let tempData = [];
    for (let searchItem of this.searchData) {
      if (searchItem.label != item.label) {
        tempData.push(searchItem);
      }
    }
    this.searchData = tempData;
    tempData = [];
    for (let tempItem of this.data) {
      if (tempItem.label != item.label) {
        tempData.push(tempItem);
      }
    }
    this.data = tempData;
    this.object.answers.push(item);


    let tempItem = cloneDeep(item)
    let objId = '';
    for (let i = 0; i < this.layoutService.section.length; i++) {
      for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {

        if (this.layoutService.section.dashboard[j].obj.type == "intellisense" &&
          this.layoutService.section.dashboard[j].obj.uicomponent_name === this.object.uicomponent_name) {
          objId = this.layoutService.section.dashboard[j].id
          break;
        }
      }
    }
      for (let r = 0; r < this.layoutService.section.dashboard.length; r++) {
        if (this.layoutService.section.dashboard[r].obj.uicomponent_name == this.object.uicomponent_name) {
          }
        if (this.layoutService.section.dashboard[r].obj.MultiSelectObj && this.layoutService.section.dashboard[r].obj.MultiSelectObj.objectid == objId) {

          this.layoutService.section.dashboard[r].obj.options.push(tempItem)

          for (let d = this.layoutService.section.dashboard[r].obj.options.length - 1; d >= 0; d--) {
            let vari = 0
            for (let e = 0; e < this.options.length; e++) {

              // if (this.layoutService.section.dashboard[r].obj.options[d].label == this.options[e].label)
              //   this.layoutService.section.dashboard[r].obj.options[d].selected = false
              if (this.layoutService.section.dashboard[r].obj.options[d].label == this.options[e].label) {
                this.layoutService.section.dashboard[r].obj.options[d].selected = false
                delete this.layoutService.section.dashboard[r].obj.options[d].selectedLinkSection
                this.layoutService.section.dashboard[r].obj.options[d].link = false
              }
              vari++
            }
            if (vari == 0)
              this.layoutService.section.dashboard[r].obj.options.splice(d, 1);
          }
        }
      }

    if (this.object.options[0] && this.object.options[0].selectedLinkSection) {
      this.optionSelect(item);
    } else {
      this.subject.instanceRefreshCheck('tick');
    }
  }

  deleteCode(item) {
    let tempItem = cloneDeep(item)
    item.selected = false;
    let tempData = [];
    for (let selectedItem of this.object.options) {
      if (selectedItem.id != item.id) {
        tempData.push(selectedItem);
      }
    }
    let objId = '';
    for (let i = 0; i < this.layoutService.section.length; i++) {
      for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {

        if (this.layoutService.section.dashboard[j].obj.type == "intellisense" &&
          this.layoutService.section.dashboard[j].obj.uicomponent_name === this.object.uicomponent_name) {
          objId = this.layoutService.section.dashboard[j].id
          break;
        }
      }
    }
    for (let x = 0; x < this.layoutService.section.length; x++) {
      for (let r = 0; r < this.layoutService.section.dashboard.length; r++) {
        if (this.layoutService.section.dashboard[r].obj.MultiSelectObj && this.layoutService.section.dashboard[r].obj.MultiSelectObj.objectid == objId) {
          for (let c = 0; this.layoutService.section.dashboard[r].obj.options && c < this.layoutService.section.dashboard[r].obj.options.length; c++) {
            if (this.layoutService.section.dashboard[r].obj.options[c].id == tempItem.id) {
              this.layoutService.section.dashboard[r].obj.options.splice(c, 1)
              break;
            }
          }
          for (let c = 0; c < this.layoutService.section.dashboard[r].obj.answers.length; c++) {
            if (tempItem.label == this.layoutService.section.dashboard[r].obj.answers[c].label || tempItem.label == this.layoutService.section.dashboard[r].obj.answers[c].name) {
              this.layoutService.section.dashboard[r].obj.answers.splice(c, 1)
              break;
            }
          }
        }
      }
    }
    this.object.options = tempData;
    this.data.push(item);
    this.searchData.push(item);
    if (this.object.options[0] && this.object.options[0].selectedLinkSection) {
      this.optionSelect(item);
    } else {
      this.subject.instanceRefreshCheck('tick');
    }
  }

  deleteOption(item) {
    item.selected = false;
    let tempItem = cloneDeep(item)
    let objId = '';
    for (let i = 0; i < this.layoutService.section.length; i++) {
      for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {

        if (this.layoutService.section.dashboard[j].obj.type == "intellisense" &&
          this.layoutService.section.dashboard[j].obj.uicomponent_name === this.object.uicomponent_name) {
          objId = this.layoutService.section.dashboard[j].id
          break;
        }
      }
    }
    for (let x = 0; x < this.layoutService.section.length; x++) {
      for (let r = 0; r < this.layoutService.section.dashboard.length; r++) {
        if (this.layoutService.section.dashboard[r].obj.MultiSelectObj && this.layoutService.section.dashboard[r].obj.MultiSelectObj.objectid == objId) {
          for (let c = 0; this.layoutService.section.dashboard[r].obj.options && c < this.layoutService.section.dashboard[r].obj.options.length; c++) {
            if (this.layoutService.section.dashboard[r].obj.options[c].id == tempItem.id) {
              this.layoutService.section.dashboard[r].obj.options.splice(c, 1)
              break;
            }
          }
          for (let c = 0; c < this.layoutService.section.dashboard[r].obj.answers.length; c++) {
            if (tempItem.label == this.layoutService.section.dashboard[r].obj.answers[c].label) {
              this.layoutService.section.dashboard[r].obj.answers.splice(c, 1)
              break;
            }
          }
        }
      }
    }
    let tempData = [];
    for (let selectedItem of this.object.answers) {
      if (selectedItem.label != item.label) {
        tempData.push(selectedItem);
      }
    }
    this.object.answers = tempData;
    if (this.object.options[0] && this.object.options[0].selectedLinkSection) {
      this.optionSelect(item);
    } else {
      this.subject.instanceRefreshCheck('tick');
    }


  }


  textClick() {
    let textArea = document.getElementById('inputText' + this.object.uicomponent_name);
    this.boundStatement = textArea.innerText;
    this.editText = true;
    this.paraClickCheck = true;
  }
  textAreaClick() {
    if (!this.paraClickCheck) {
      // while(!document.getElementById('inputText'))
      // {
      //   this.changeDetector.detectChanges();
      // }
      let textArea: any = document.getElementById('inputText' + this.object.uicomponent_name);
      // var all = textArea.getElementsByTagName("*");
      // var tagname
      // var tagendname
      // for (var i = 0, max = all.length; i < max; i++) {
      //   if (i == 0) {
      //     tagname = "<" + all[i].tagName
      //     if (all[i].style.cssText != undefined) {
      //       tagname = tagname + " style='" + all[i].style.cssText + "'"
      //     }
      //     tagname = tagname + ">"
      //   }
      //   else {
      //     tagname = tagname + "<" + all[i].tagName
      //     if (all[i].style.cssText != undefined) {
      //       tagname = tagname + " style='" + all[i].style.cssText + "'"
      //     }
      //     tagname = tagname + ">"
      //   }
      // }
      // for (var i = 0, max = all.length; i < max; i++) {
      //   if (i == 0) {
      //     tagendname = "</" + all[i].tagName
      //     if (all[i].style.cssText != undefined) {
      //       tagendname = tagendname + " style='" + all[i].style.cssText + "'"
      //     }
      //     tagendname = tagendname + ">"
      //   }
      //   else {
      //     tagendname = tagendname + "</" + all[i].tagName
      //     if (all[i].style.cssText != undefined) {
      //       tagendname = tagendname + " style='" + all[i].style.cssText + "'"
      //     }
      //     tagendname = tagendname + ">"
      //   }
      // }
      // if (tagname != undefined) {
      //   tagname = tagname + this.boundStatement
      //   tagname = tagname + tagendname
      // }
      // if (tagname != undefined) {
      //   textArea.innerHTML = tagname
      // }
      //
      if (textArea.innerText!=this.boundStatement) {
        textArea.innerText = this.boundStatement;
      }
      this.object.statement = this.sanitizer.bypassSecurityTrustHtml(textArea.innerHTML);

      this.editText = false;
    } else {
      this.paraClickCheck = false;
    }
  }
  optionSelect(item) {
    let options = this.object.options;
    let index = 0;
    for (let i = 0; i < this.object.options.length; i++) {
      if (this.object.options[i].id == item.id) {
        index = i;
      }
    }
    let sectionsToHide = [];
    let sectionsToShow = [];
    if (options[index].selectedLinkSection.id) {
      for (let i = 0; i < this.layoutService.section.length; i++) {
        if (this.layoutService.section.id == options[index].selectedLinkSection.id) {
          if (options[index].selected) {
            this.layoutService.section.selected_linked_component++;
            let currentDepth = this.layoutService.section.secNo.split(".").length - 1;
            for (let j = i + 1; j < this.layoutService.section.length; j++) {
              let tempDepth = this.layoutService.section.secNo.split(".").length - 1;
              if (tempDepth > currentDepth) {
                this.layoutService.section.selected_linked_component++;
              } else {
                i = j - 1;
                break;
              }
            }
          } else {
            this.layoutService.section.selected_linked_component--;
            let currentDepth = this.layoutService.section.secNo.split(".").length - 1;
            for (let j = i + 1; j < this.layoutService.section.length; j++) {
              let tempDepth = this.layoutService.section.secNo.split(".").length - 1;
              if (tempDepth > currentDepth) {
                this.layoutService.section.selected_linked_component--;
              } else {
                i = j - 1;
                break;
              }
            }
          }
        }
      }
    }

      for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
        if (this.layoutService.section.dashboard[i].obj.type == "text") {
          let tempStatement = ""
          tempStatement = this.layoutService.section.dashboard[i].obj.statement
          let arr = tempStatement.split('>').join('> ').split('<').join(' <').split(" ").join(',').split('.').join(',').split("\n").join(',').split(',')
          for (let j = 0; j < arr.length; j++) {
            if (arr[j][0] == "@") {
              arr[j] = arr[j].replace('@', '');
              //console.log("1 >> replace")
              //  arr[j][0] = '';
              for (let k = 0; k < this.layoutService.section.dashboard.length; k++) {
                //console.log("2  >> answers")
                if (arr[j] == this.layoutService.section.dashboard[k].obj.uicomponent_name) {
                  //console.log("AAAAAAAAAAA " + this.layoutService.section.dashboard[k].obj.answers)
                  let answer = '';
                  for (let l = 0; l < this.layoutService.section.dashboard[k].obj.answers.length; l++) {
                    if (this.layoutService.section.dashboard[k].obj.type == "intellisense") {
                      answer = answer + this.layoutService.section.dashboard[k].obj.answers[l].label + " "
                    }
                    else {
                      answer = answer + this.layoutService.section.dashboard[k].obj.answers[l].answer + " "
                    }
                  }
                  arr[j] = answer
                  if (this.layoutService.section.dashboard[i].obj.isBold) {
                    arr[j] = "<b>" + arr[j] + "</b>"
                  }
                  if (this.layoutService.section.dashboard[i].obj.isItalic) {
                    arr[j] = "<i>" + arr[j] + "</i>"
                  }
                  if (this.layoutService.section.dashboard[i].obj.isUnderline) {
                    arr[j] = "<u>" + arr[j] + "</u>"
                  }
                  //console.log("ABC " + arr[j])
                }
              }
            }

          }

          //console.log("Final " + arr.join(" "));
          this.layoutService.section.dashboard[i].obj["instanceStatement"] = arr.join(" ");
          arr = [];
          //console.log("PPPPPPPPPP >>>>>>>> " + arr[0])
        }

        this.subject.gridRefreshItem('coll')

      }

  }



}
