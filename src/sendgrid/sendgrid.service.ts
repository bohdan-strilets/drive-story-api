import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendgrid from '@sendgrid/mail';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { EmailType } from './types/email.type';
import { HbsTemplate } from './types/hbs-template.type';

@Injectable()
export class SendgridService {
  private readonly sendgridOwner: string;
  private readonly apiUrl: string;
  private readonly clientUrl: string;
  private readonly rootPath: string = join(
    __dirname,
    '..',
    '..',
    'src',
    'sendgrid',
    'templates',
  );
  private readonly currentYear = new Date().getFullYear().toString();
  private readonly logger = new Logger(SendgridService.name);

  constructor(private readonly configService: ConfigService) {
    sendgrid.setApiKey(this.configService.get('SENDGRID_API_KEY'));

    this.sendgridOwner = this.configService.get('SENDGRID_OWNER');
    this.apiUrl = this.configService.get('API_URL');
    this.clientUrl = this.configService.get('CLIENT_URL');
  }

  private async renderTemplateAsync(
    templatePath: string,
    variables?: HbsTemplate,
  ): Promise<string> {
    const templateSource = await fs.promises.readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(variables);
  }

  private async sendEmail(emailData: EmailType) {
    const sendgridOwner = this.sendgridOwner;
    const email = { ...emailData, from: sendgridOwner };
    await sendgrid.send(email);
    this.logger.log(`Email sent to ${email.to} successfully.`);
  }

  private async sendTemplateEmail(
    email: string,
    subject: string,
    templateFileName: string,
    variables: HbsTemplate,
  ): Promise<void> {
    const templatePath = join(this.rootPath, templateFileName);
    const htmlContent = await this.renderTemplateAsync(templatePath, variables);

    await this.sendEmail({
      to: email,
      subject,
      html: htmlContent,
      from: this.sendgridOwner,
    });
  }

  async sendConfirmEmailLetter(
    email: string,
    activationToken: string,
  ): Promise<void> {
    await this.sendTemplateEmail(
      email,
      'Welcome! Activate Your Account.',
      'activation-email.template.hbs',
      {
        API_URL: this.apiUrl,
        activationToken,
        supportEmail: this.sendgridOwner,
        year: this.currentYear,
      },
    );
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    await this.sendTemplateEmail(
      email,
      'Reset Your Password',
      'reset-password.template.hbs',
      {
        API_URL: this.apiUrl,
        resetToken,
        supportEmail: this.sendgridOwner,
        year: this.currentYear,
      },
    );
  }

  async sendPasswordChangedSuccess(email: string): Promise<void> {
    await this.sendTemplateEmail(
      email,
      'Password Changed Successfully',
      'password-changed-success.template.hbs',
      {
        supportEmail: this.sendgridOwner,
        year: this.currentYear,
      },
    );
  }

  async sendReminderEmail(
    email: string,
    title: string,
    reminderDate: Date,
    message: string,
    eventUrl: string,
  ): Promise<void> {
    await this.sendTemplateEmail(email, title, 'reminder.template.hbs', {
      title,
      reminderDate: reminderDate.toDateString(),
      message,
      eventUrl,
      clientUrl: this.clientUrl,
      supportEmail: this.sendgridOwner,
      year: this.currentYear,
    });
  }
}
