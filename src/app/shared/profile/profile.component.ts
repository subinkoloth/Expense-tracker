import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusinessDataService } from 'src/app/services/business-data.service';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{
  user_name:any='';
  editable:boolean=false;
  isProcess:boolean=true;
  name:any='';
  lines:any=[];
  isEdit:boolean=false;
  newName:any;
  newUsername:any;
  userId:any;
  constructor(
    public businessData:BusinessDataService,
    public snackBar:MatSnackBar,
    public dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.userId=sessionStorage.getItem('Id')?.split(' ')[1];
    this.isProcess=true;
    this.businessData.getAllSaveData().subscribe((res:any)=>{
      setTimeout(() => {
        this.isProcess=false;
        this.editable=true;
        if(this.userId===environment.adminId){
          this.editable=false;
        }
      }, 1000);
      let firstDate=(res.data.firstLoginDate).toString().split('T')[0];
      let lastLogin=(res.data.lastLoginDate).toString().split('T')[0];
      this.lines=[
        {content:'User Since',text:firstDate},
        {content:'Expense Logged',text:res.data.expenseLogged},
        {content:'Last Login',text:lastLogin},
      ];
      this.name=res.data.name;
      this.user_name=res.data.username;
      this.newName=res.data.name;
      this.newUsername=res.data.username;
    });
  }

  toggleEditOrSave(){
    if(!this.isEdit){
      // enter edit mode
      this.isEdit = true;
      return;
    }
    // in edit mode -> save and exit
    const body = { username: this.newUsername, name: this.newName };
    const unchanged = (this.name === this.newName) && (this.user_name === this.newUsername);
    if(unchanged){
      this.isEdit = false;
      this.snackBar.open('No changes to save','',{duration:1500});
      return;
    }
    this.businessData.updateProfile(body).subscribe((res:any)=>{
      if(res){
        this.businessData.updateWholeInfo(body).subscribe(()=>{});
        // reflect changes locally
        this.name = this.newName;
        this.user_name = this.newUsername;
        this.isEdit = false;
        this.snackBar.open('Profile Updated','',{duration:2000});
      }
    },error=>{
      this.snackBar.open('Server Error','',{duration:2000});
    });
  }

  onDeleteAccount(){
    this.dialog.open(AlertBoxComponent, { data:{type:'delete'} });
  }
}
