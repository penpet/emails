import { readdir, readFile as _readFile } from 'fs'
import { SES } from 'aws-sdk'

const ses = new SES()

export const readFolder = (path: string) =>
	new Promise<string[]>((resolve, reject) => {
		readdir(path, (error, files) => {
			error ? reject(error) : resolve(files)
		})
	})

export const readFile = (path: string) =>
	new Promise<string>((resolve, reject) => {
		_readFile(path, 'utf8', (error, data) => {
			error ? reject(error) : resolve(data)
		})
	})

export const uploadTemplate = (template: SES.Template) =>
	new Promise<void>((resolve, reject) => {
		ses.createTemplate({ Template: template }, error => {
			if (!error) return resolve()
			if (error.code !== 'AlreadyExists') return reject(error)

			ses.updateTemplate({ Template: template }, error => {
				error ? reject(error) : resolve()
			})
		})
	})

export const sleep = (ms: number) =>
	new Promise<void>(resolve => {
		setTimeout(resolve, ms)
	})
