import {Octokit} from '@octokit/rest';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from "rxjs";
import {Component, OnInit} from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'CV - Daniel Macías';

  public linkedinProfile: any;
  public repositories: any;
  public repositoriesShowing: any;
  public languages: Set<String> = new Set();

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.loadGithubProfile();
    this.loadLinkedinProfile();
  }

  public filterRepositories(language: String) {
    this.repositoriesShowing = this.repositories;
    this.repositoriesShowing = this.repositoriesShowing.filter((repository: { languages: String[]; }) => {
      return repository.languages.indexOf(language) > -1;
    });
  }

  public resetFilterRepositories() {
    this.repositoriesShowing = this.repositories;
  }

  public getLinkedinProfile(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: environment.linkedinToken
      })
    };
    return this.http.get(environment.linkedinAPI, httpOptions);
  }

  private loadGithubProfile() {
    const octokit = new Octokit({
      auth: environment.githubToken,
    });

    octokit.rest.repos.listForUser({
      username: 'danimacs',
      sort: 'created',
      direction: 'desc',
      per_page: 6
    }).then((res) => {
      this.repositories = res.data;
    }).then(() => {
        this.repositories.forEach((repository: any) => {
          octokit.rest.repos.listLanguages({
            owner: 'danimacs',
            repo: repository.name,
          }).then((res) => {
            let languages = Object.keys(res.data);
            repository.languages = languages;
            languages.forEach(language => this.languages.add(language));
          });
        })
        this.repositoriesShowing = this.repositories;
      }
    );
  }

  private loadLinkedinProfile() {
    this.getLinkedinProfile().subscribe(linkedinProfile => {
      this.linkedinProfile = linkedinProfile;
    })
  }

}
